import { NextResponse } from 'next/server';
import { authLib } from '@/lib/auth';
import { createRequestClient, supabaseAdmin } from '@/lib/supabase/server';
import { paymentService } from '@/services/payment.service';
import { FEATURED_PROFILE_PRICES, CONSULTATION_PRICE } from '@/constants/payments';
import { razorpayConfig } from '@/lib/payments/config';

export async function POST(req: Request) {
  try {
    const user = await authLib.getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestClient = await createRequestClient();

    // Resolve user's actual database UUID (users.id) from auth_user_id
    const { data: userRow } = await requestClient
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (!userRow) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }
    const dbUserId = userRow.id;

    const body = await req.json();
    const { paymentType, planId, couponCode, bookingDetails, featuredDays } = body;

    let originalPrice = 0;
    let description = '';

    if (paymentType === 'subscription') {
      if (!planId) {
        return NextResponse.json({ error: 'planId is required for subscriptions' }, { status: 400 });
      }
      const { data: plan, error: planErr } = await requestClient
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .maybeSingle();

      if (planErr || !plan) {
        return NextResponse.json({ error: 'Subscription plan not found' }, { status: 404 });
      }
      originalPrice = Number(plan.price);
      description = `Gokul Vivaham - ${plan.name}`;
    } else if (paymentType === 'featured_profile') {
      const days = Number(featuredDays) || 30;
      originalPrice = days === 30 ? FEATURED_PROFILE_PRICES.DAYS_30 : FEATURED_PROFILE_PRICES.DAYS_15;
      description = `Gokul Vivaham - Featured Profile for ${days} Days`;
    } else if (paymentType === 'consultation') {
      originalPrice = CONSULTATION_PRICE; // Flat rate for consultation bookings
      description = `Gokul Vivaham - Astrologer Consultation`;
    } else {
      return NextResponse.json({ error: 'Invalid paymentType' }, { status: 400 });
    }

    // Calculate coupon discount
    let discount = 0;
    let appliedCouponId = null;

    if (couponCode) {
      const { data: coupon } = await requestClient
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .gt('expiry_date', new Date().toISOString())
        .maybeSingle();

      if (coupon && coupon.uses_count < coupon.max_uses) {
        appliedCouponId = coupon.id;
        if (coupon.discount_type === 'percentage') {
          discount = (originalPrice * Number(coupon.discount_value)) / 100;
        } else if (coupon.discount_type === 'flat') {
          discount = Number(coupon.discount_value);
        }
      }
    }

    const finalPrice = Math.max(0, originalPrice - discount);

    // Call reusable payment service to create order
    const receipt = `rcpt_${Math.random().toString(36).substring(2, 11)}`;
    const { order: orderData, error: orderErr } = await paymentService.createOrder(finalPrice, receipt);

    if (orderErr || !orderData) {
      return NextResponse.json({ error: 'Failed to create order on payment gateway' }, { status: 500 });
    }

    const rzpAmountPaise = Number(orderData.amount);

    // Create a pending payment row using admin connection to bypass regular user insert policies
    const { data: paymentRecord, error: payErr } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: dbUserId,
        amount: finalPrice,
        currency: 'INR',
        status: 'pending',
        payment_type: paymentType,
        razorpay_order_id: orderData.id,
        coupon_id: appliedCouponId
      })
      .select()
      .single();

    if (payErr) {
      console.error('Payment creation error:', payErr);
      return NextResponse.json({ error: 'Failed to initialize payment record' }, { status: 500 });
    }

    // Save temporary details for consultations if needed
    if (paymentType === 'consultation' && bookingDetails) {
      // Create pending booking record associated with this payment
      await supabaseAdmin.from('consultation_bookings').insert({
        user_id: dbUserId,
        payment_id: paymentRecord.id,
        booking_type: bookingDetails.bookingType || 'personal_consultation',
        scheduled_date: bookingDetails.scheduledDate,
        scheduled_slot: bookingDetails.scheduledSlot,
        notes: bookingDetails.notes || '',
        status: 'pending'
      });
    }

    return NextResponse.json({
      orderId: orderData.id,
      amount: rzpAmountPaise,
      currency: 'INR',
      keyId: razorpayConfig.keyId,
      description,
      user: {
        name: user.user_metadata?.full_name || 'Valued Member',
        email: user.email,
        phone: (user as any).phone || ''
      }
    });

  } catch (err: any) {
    console.error('Create Order Handler error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
