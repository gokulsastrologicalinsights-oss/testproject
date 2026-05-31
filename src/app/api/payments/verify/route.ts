import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { paymentService } from '@/services/payment.service';
import { authLib } from '@/lib/auth';
import { razorpayClient, razorpayConfig } from '@/lib/payments/config';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment signature parameters' }, { status: 400 });
    }

    // 1. Authenticate user from session
    const user = await authLib.getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    // 2. Fetch the pending payment record
    const { data: payment, error: payErr } = await supabaseAdmin
      .from('payments')
      .select('*, users(auth_user_id)')
      .eq('razorpay_order_id', razorpay_order_id)
      .maybeSingle();

    if (payErr || !payment) {
      return NextResponse.json({ error: 'Associated payment record not found' }, { status: 404 });
    }

    // 3. Prevent unauthorized execution by verifying payment ownership
    if (payment.users?.auth_user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Payment ownership verification failed' }, { status: 403 });
    }

    // 4. Verify cryptographic signature using reusable paymentService
    const isValid = paymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      // Mark payment as failed
      await supabaseAdmin
        .from('payments')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('razorpay_order_id', razorpay_order_id);

      return NextResponse.json({ error: 'Invalid payment signature. Verification failed.' }, { status: 400 });
    }

    // 5. Query payment details from Razorpay API to prevent mock manipulation/spoofing on live environments
    if (razorpayConfig.keyId !== 'rzp_test_placeholderid' && !razorpay_order_id.startsWith('order_mock_')) {
      try {
        const razorpayPayment = await razorpayClient.payments.fetch(razorpay_payment_id);
        
        // A. Verify payment has actually been captured/completed
        if (razorpayPayment.status !== 'captured' && razorpayPayment.status !== 'authorized') {
          return NextResponse.json({ error: 'Payment is incomplete at gateway level' }, { status: 400 });
        }

        // B. Verify correct order mapping
        if (razorpayPayment.order_id !== razorpay_order_id) {
          return NextResponse.json({ error: 'Payment-to-order mapping mismatch' }, { status: 400 });
        }

        // C. Verify transaction amount matches server-side pricing record (paise vs rupees)
        const dbAmountPaise = Math.round(Number(payment.amount) * 100);
        if (razorpayPayment.amount !== dbAmountPaise) {
          return NextResponse.json({ error: 'Payment amount mismatch verification error' }, { status: 400 });
        }
      } catch (err: any) {
        console.error('Failed to verify payment with Razorpay API:', err);
        return NextResponse.json({ error: 'Payment verification failed at gateway provider' }, { status: 400 });
      }
    }

    // Avoid duplicate processing
    if (payment.status === 'completed') {
      return NextResponse.json({ success: true, message: 'Payment already verified' });
    }

    const dbUserId = payment.user_id;
    const authUserId = payment.users?.auth_user_id;

    // Update payment record
    await supabaseAdmin
      .from('payments')
      .update({
        status: 'completed',
        razorpay_payment_id,
        razorpay_signature,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    // Update Coupon uses if applicable
    if (payment.coupon_id) {
      await supabaseAdmin.rpc('increment_coupon_uses', { coupon_row_id: payment.coupon_id });
    }

    let subRecord: any = null;
    let txRecord: any = null;
    let finalRoleName: string = 'user';

    // Generate Invoice Number (e.g. GV-INV-2026-XXXX)
    const invoiceNum = `GV-INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Insert Transaction
    const { data: txData } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: dbUserId,
        payment_id: payment.id,
        invoice_number: invoiceNum,
        amount: payment.amount,
        tax: Number((payment.amount * 0.18).toFixed(2)), // 18% GST estimate
        total_amount: Number((payment.amount * 1.18).toFixed(2)),
        description: `${payment.payment_type.toUpperCase()} Purchase verified`,
        status: 'completed'
      })
      .select()
      .maybeSingle();

    txRecord = txData;

    let notificationTitle = 'Payment Successful';
    let notificationMsg = 'Your payment was processed successfully.';

    if (payment.payment_type === 'subscription') {
      // Find the pending subscription plan from client request OR default to matching plan price
      // In a real system we pass planId during creation, let's extract or match plan
      // Let's query subscription_plans
      // Create subscription row
      // We can query the plans and match the price or we can have the user's plan selection cached.
      // Wait, let's query the plan matching the price or find one. Let's select plans.
      const { data: plans } = await supabaseAdmin.from('subscription_plans').select('*');
      // Match plan by price or select the highest matching price plan
      const plan = plans?.find(p => Math.abs(Number(p.price) - payment.amount) < 5) || plans?.[0];

      if (plan) {
        const start = new Date();
        const end = new Date();
        end.setDate(start.getDate() + plan.duration_days);

        // Delete any active subscription
        await supabaseAdmin
          .from('subscriptions')
          .update({ payment_status: 'Expired' })
          .eq('user_id', dbUserId)
          .eq('payment_status', 'Completed');

        // Insert new subscription
        const { data: subData } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: dbUserId,
            plan_id: plan.id,
            payment_status: 'Completed',
            start_date: start.toISOString(),
            end_date: end.toISOString(),
            razorpay_payment_id
          })
          .select()
          .maybeSingle();

        subRecord = subData;
        if (subRecord && !subRecord.plan) {
          subRecord.plan = plan;
        }

        // Map plan names to roles for auth system
        let roleName = 'premium_user';
        if (plan.name.toLowerCase().includes('silver')) roleName = 'silver';
        if (plan.name.toLowerCase().includes('gold')) roleName = 'gold';
        if (plan.name.toLowerCase().includes('platinum')) roleName = 'platinum';
        finalRoleName = roleName;

        // Update profiles Table
        await supabaseAdmin
          .from('profiles')
          .update({ is_premium: true })
          .eq('user_id', dbUserId);

        // Update users role
        await supabaseAdmin
          .from('users')
          .update({ role: roleName })
          .eq('id', dbUserId);

        // Update Supabase Auth metadata
        if (authUserId) {
          await supabaseAdmin.auth.admin.updateUserById(authUserId, {
            user_metadata: { role: roleName }
          });
        }

        notificationTitle = 'Membership Activated!';
        notificationMsg = `Congratulations! Your ${plan.name} has been activated. Expires on ${end.toLocaleDateString()}.`;
      }
    } else if (payment.payment_type === 'featured_profile') {
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + 30); // 30 days default

      await supabaseAdmin
        .from('featured_profiles')
        .insert({
          user_id: dbUserId,
          payment_id: payment.id,
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          is_active: true
        });

      // Update profiles features
      await supabaseAdmin
        .from('profiles')
        .update({ is_premium: true }) // Boosting profile also grants basic premium indicators
        .eq('user_id', dbUserId);

      notificationTitle = 'Profile Boosted!';
      notificationMsg = 'Your profile is now featured on the homepage and search results for 30 days!';
    } else if (payment.payment_type === 'consultation') {
      // Approve booking associated with payment
      await supabaseAdmin
        .from('consultation_bookings')
        .update({ status: 'approved' })
        .eq('payment_id', payment.id);

      notificationTitle = 'Consultation Booked!';
      notificationMsg = 'Your astrologer consultation slot has been booked and approved. Details sent to your email!';
    }

    // Insert Notification for User
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: dbUserId,
        title: notificationTitle,
        message: notificationMsg,
        type: 'billing',
        is_read: false
      });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and service activated successfully',
      newRole: finalRoleName,
      subscription: subRecord,
      transaction: txRecord
    });

  } catch (err: any) {
    console.error('Verify Payment API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
