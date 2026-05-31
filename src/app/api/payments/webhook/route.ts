import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { paymentService } from '@/services/payment.service';
import { razorpayClient, razorpayConfig } from '@/lib/payments/config';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature header' }, { status: 400 });
    }

    // Verify webhook signature using reusable paymentService
    const isValid = paymentService.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.warn('[Webhook Warning] Invalid webhook signature detected');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const eventId = payload.id;

    if (!eventId) {
      return NextResponse.json({ error: 'Missing event ID in payload' }, { status: 400 });
    }

    console.log(`[Webhook Received Event] ${event} (ID: ${eventId})`);

    // 1. Deduplication: Attempt to insert the event into processed_webhook_events
    const { error: logError } = await supabaseAdmin
      .from('processed_webhook_events')
      .insert({
        event_id: eventId,
        event_type: event,
        status: 'processing',
        payload
      });

    if (logError) {
      if (logError.code === '23505') { // Unique constraint violation (duplicate key)
        const { data: existingLog } = await supabaseAdmin
          .from('processed_webhook_events')
          .select('status')
          .eq('event_id', eventId)
          .maybeSingle();

        if (existingLog?.status === 'completed') {
          console.log(`[Webhook Bypass] Event ${eventId} already processed successfully`);
          return NextResponse.json({ success: true, message: 'Event already processed' });
        }
        if (existingLog?.status === 'processing') {
          console.warn(`[Webhook Conflict] Event ${eventId} is currently being processed by another instance`);
          return NextResponse.json({ error: 'Event is currently being processed' }, { status: 409 });
        }
        // If status was 'failed', we retry processing
        await supabaseAdmin
          .from('processed_webhook_events')
          .update({ status: 'processing', error_message: null, processed_at: new Date().toISOString() })
          .eq('event_id', eventId);
      } else {
        console.error('Failed to log webhook event status:', logError);
        return NextResponse.json({ error: 'Failed to record event log' }, { status: 500 });
      }
    }

    // 2. Process the event
    try {
      if (event === 'payment.captured' || event === 'order.paid') {
        await handlePaymentCaptured(payload);
      } else if (event === 'payment.failed') {
        await handlePaymentFailed(payload);
      } else if (event === 'subscription.activated') {
        await handleSubscriptionActivated(payload);
      } else if (event === 'subscription.charged') {
        await handleSubscriptionCharged(payload);
      } else if (
        event === 'subscription.halted' ||
        event === 'subscription.cancelled' ||
        event === 'subscription.completed'
      ) {
        await handleSubscriptionDeactivated(payload, event);
      } else {
        console.log(`[Webhook Info] Unhandled event type: ${event}`);
      }

      // 3. Mark event as completed on success
      await supabaseAdmin
        .from('processed_webhook_events')
        .update({ status: 'completed', processed_at: new Date().toISOString() })
        .eq('event_id', eventId);

      return NextResponse.json({ received: true });

    } catch (processErr: any) {
      console.error(`[Webhook Error] Processing failed for event ${eventId}:`, processErr);

      // Mark event as failed in db
      await supabaseAdmin
        .from('processed_webhook_events')
        .update({
          status: 'failed',
          error_message: processErr.message || 'Unknown processing error',
          processed_at: new Date().toISOString()
        })
        .eq('event_id', eventId);

      return NextResponse.json({ error: processErr.message || 'Event processing failed' }, { status: 500 });
    }

  } catch (err: any) {
    console.error('Webhook Endpoint Initial Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

async function handlePaymentCaptured(payload: any) {
  const paymentEntity = payload.payload.payment.entity;
  const razorpay_order_id = paymentEntity.order_id;
  const razorpay_payment_id = paymentEntity.id;

  if (!razorpay_order_id) {
    // If there is no order_id, it could be a subscription renewal charge.
    // Subscription renewal charges are handled by subscription.charged event.
    console.log('[Webhook Info] payment.captured has no order_id, skipping direct processing (handled by subscription.charged)');
    return;
  }

  // Fetch the pending payment record
  const { data: payment, error: payErr } = await supabaseAdmin
    .from('payments')
    .select('*, users(auth_user_id)')
    .eq('razorpay_order_id', razorpay_order_id)
    .maybeSingle();

  if (payErr || !payment) {
    throw new Error(`Associated payment record not found for order ${razorpay_order_id}`);
  }

  if (payment.status === 'completed') {
    console.log(`[Webhook Info] Payment for order ${razorpay_order_id} already marked completed in DB`);
    return;
  }

  // Verify amount matches server-side database record
  const expectedAmountPaise = Math.round(Number(payment.amount) * 100);
  if (paymentEntity.amount !== expectedAmountPaise) {
    throw new Error(`Amount verification failed: expected ${expectedAmountPaise} paise, got ${paymentEntity.amount} paise`);
  }

  // Fetch from Razorpay API to prevent mock manipulation/spoofing on live environments
  if (razorpayConfig.keyId !== 'rzp_test_placeholderid' && !razorpay_order_id.startsWith('order_mock_')) {
    const razorpayPayment = await razorpayClient.payments.fetch(razorpay_payment_id);
    if (razorpayPayment.status !== 'captured' && razorpayPayment.status !== 'authorized') {
      throw new Error(`Razorpay verification failed: payment status is ${razorpayPayment.status}`);
    }
    if (razorpayPayment.amount !== expectedAmountPaise) {
      throw new Error(`Razorpay verification failed: live amount ${razorpayPayment.amount} mismatch`);
    }
  }

  const dbUserId = payment.user_id;
  const authUserId = payment.users?.auth_user_id;

  // Update payment record
  const { error: updatePayErr } = await supabaseAdmin
    .from('payments')
    .update({
      status: 'completed',
      razorpay_payment_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', payment.id);

  if (updatePayErr) {
    throw new Error(`Failed to update payment status: ${updatePayErr.message}`);
  }

  // Update Coupon uses if applicable
  if (payment.coupon_id) {
    await supabaseAdmin.rpc('increment_coupon_uses', { coupon_row_id: payment.coupon_id });
  }

  // Generate invoice number
  const invoiceNum = `GV-INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  // Insert transaction ledger
  const { error: txErr } = await supabaseAdmin
    .from('transactions')
    .insert({
      user_id: dbUserId,
      payment_id: payment.id,
      invoice_number: invoiceNum,
      amount: payment.amount,
      tax: Number((payment.amount * 0.18).toFixed(2)),
      total_amount: Number((payment.amount * 1.18).toFixed(2)),
      description: `${payment.payment_type.toUpperCase()} Purchase verified via Webhook`,
      status: 'completed'
    });

  if (txErr) {
    console.error('Failed to log transaction record:', txErr);
  }

  let notificationTitle = 'Payment Completed';
  let notificationMsg = 'Your payment was completed successfully.';

  if (payment.payment_type === 'subscription') {
    const { data: plans } = await supabaseAdmin.from('subscription_plans').select('*');
    const plan = plans?.find(p => Math.abs(Number(p.price) - payment.amount) < 5) || plans?.[0];

    if (plan) {
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + plan.duration_days);

      // Expire old subscriptions
      await supabaseAdmin
        .from('subscriptions')
        .update({ payment_status: 'Expired' })
        .eq('user_id', dbUserId)
        .eq('payment_status', 'Completed');

      // Insert new subscription
      await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: dbUserId,
          plan_id: plan.id,
          payment_status: 'Completed',
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          razorpay_payment_id
        });

      // Map role
      let roleName = 'premium_user';
      if (plan.name.toLowerCase().includes('silver')) roleName = 'silver';
      if (plan.name.toLowerCase().includes('gold')) roleName = 'gold';
      if (plan.name.toLowerCase().includes('platinum')) roleName = 'platinum';

      // Update profiles
      await supabaseAdmin
        .from('profiles')
        .update({ is_premium: true })
        .eq('user_id', dbUserId);

      // Update users role
      await supabaseAdmin
        .from('users')
        .update({ role: roleName })
        .eq('id', dbUserId);

      // Update Auth metadata
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
    end.setDate(start.getDate() + 30);

    await supabaseAdmin
      .from('featured_profiles')
      .insert({
        user_id: dbUserId,
        payment_id: payment.id,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        is_active: true
      });

    await supabaseAdmin
      .from('profiles')
      .update({ is_premium: true })
      .eq('user_id', dbUserId);

    notificationTitle = 'Profile Boosted!';
    notificationMsg = 'Your profile is now featured on the homepage and search results for 30 days!';
  } else if (payment.payment_type === 'consultation') {
    await supabaseAdmin
      .from('consultation_bookings')
      .update({ status: 'approved' })
      .eq('payment_id', payment.id);

    notificationTitle = 'Consultation Booked!';
    notificationMsg = 'Your astrologer consultation slot has been booked and approved. Details sent to your email!';
  }

  // Add user notification
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: dbUserId,
      title: notificationTitle,
      message: notificationMsg,
      type: 'billing',
      is_read: false
    });
}

async function handlePaymentFailed(payload: any) {
  const paymentEntity = payload.payload.payment.entity;
  const razorpay_order_id = paymentEntity.order_id;

  if (!razorpay_order_id) return;

  const { data: updatedPay } = await supabaseAdmin
    .from('payments')
    .update({ status: 'failed', updated_at: new Date().toISOString() })
    .eq('razorpay_order_id', razorpay_order_id)
    .select()
    .maybeSingle();

  if (updatedPay) {
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: updatedPay.user_id,
        title: 'Payment Failed',
        message: 'Your payment process was unsuccessful. Please try again.',
        type: 'billing',
        is_read: false
      });
  }
}

async function handleSubscriptionActivated(payload: any) {
  const subscriptionEntity = payload.payload.subscription.entity;
  const razorpay_subscription_id = subscriptionEntity.id;

  // Try to find a subscription record with this subscription_id
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('razorpay_subscription_id', razorpay_subscription_id)
    .maybeSingle();

  if (subscription) {
    // Already in DB, update to Completed if Pending
    if (subscription.payment_status !== 'Completed') {
      const start = new Date(subscriptionEntity.current_start * 1000).toISOString();
      const end = new Date(subscriptionEntity.current_end * 1000).toISOString();

      await supabaseAdmin
        .from('subscriptions')
        .update({
          payment_status: 'Completed',
          start_date: start,
          end_date: end,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
    }
  } else {
    // If not found in DB by subscription_id, look up by user notes
    const dbUserId = subscriptionEntity.notes?.user_id;
    if (!dbUserId) {
      throw new Error(`Cannot associate subscription ${razorpay_subscription_id} - no user_id in notes`);
    }

    const { data: plans } = await supabaseAdmin.from('subscription_plans').select('*');
    
    const { data: userRow } = await supabaseAdmin
      .from('users')
      .select('auth_user_id')
      .eq('id', dbUserId)
      .maybeSingle();

    if (!userRow) {
      throw new Error(`User not found for ID: ${dbUserId}`);
    }

    // Try to match plan
    let amountInInr = 0;
    if (razorpayConfig.keyId !== 'rzp_test_placeholderid') {
      try {
        const razorpayPlan = await razorpayClient.plans.fetch(subscriptionEntity.plan_id) as any;
        amountInInr = razorpayPlan.amount / 100;
      } catch (err) {
        console.error('Failed to fetch plan details from Razorpay API:', err);
      }
    }
    
    const plan = plans?.find(p => Math.abs(Number(p.price) - amountInInr) < 5) || plans?.[0];

    if (plan) {
      const start = new Date(subscriptionEntity.current_start * 1000).toISOString();
      const end = new Date(subscriptionEntity.current_end * 1000).toISOString();

      // Expire old ones
      await supabaseAdmin
        .from('subscriptions')
        .update({ payment_status: 'Expired' })
        .eq('user_id', dbUserId)
        .eq('payment_status', 'Completed');

      // Insert new one
      await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: dbUserId,
          plan_id: plan.id,
          payment_status: 'Completed',
          start_date: start,
          end_date: end,
          razorpay_subscription_id
        });

      // Update profiles, roles, and auth metadata
      let roleName = 'premium_user';
      if (plan.name.toLowerCase().includes('silver')) roleName = 'silver';
      if (plan.name.toLowerCase().includes('gold')) roleName = 'gold';
      if (plan.name.toLowerCase().includes('platinum')) roleName = 'platinum';

      await supabaseAdmin.from('profiles').update({ is_premium: true }).eq('user_id', dbUserId);
      await supabaseAdmin.from('users').update({ role: roleName }).eq('id', dbUserId);
      if (userRow.auth_user_id) {
        await supabaseAdmin.auth.admin.updateUserById(userRow.auth_user_id, {
          user_metadata: { role: roleName }
        });
      }
    }
  }
}

async function handleSubscriptionCharged(payload: any) {
  const subscriptionEntity = payload.payload.subscription.entity;
  const paymentEntity = payload.payload.payment.entity;
  const razorpay_subscription_id = subscriptionEntity.id;
  const razorpay_payment_id = paymentEntity.id;
  const amount = paymentEntity.amount / 100;

  // Find user ID from notes
  const dbUserId = subscriptionEntity.notes?.user_id || paymentEntity.notes?.user_id;
  if (!dbUserId) {
    throw new Error(`Cannot process subscription charge ${razorpay_subscription_id} - no user_id in notes`);
  }

  const { data: userRow } = await supabaseAdmin
    .from('users')
    .select('auth_user_id')
    .eq('id', dbUserId)
    .maybeSingle();

  if (!userRow) {
    throw new Error(`User not found for ID: ${dbUserId}`);
  }

  const authUserId = userRow.auth_user_id;

  // Query subscription plans to find matching plan
  const { data: plans } = await supabaseAdmin.from('subscription_plans').select('*');
  const amountInInr = amount;
  
  const plan = plans?.find(p => Math.abs(Number(p.price) - amountInInr) < 5) || plans?.[0];
  if (!plan) {
    throw new Error(`No matching plan found for amount: ${amountInInr}`);
  }

  const start = new Date(subscriptionEntity.current_start * 1000).toISOString();
  const end = new Date(subscriptionEntity.current_end * 1000).toISOString();

  // Create payment record (since each charge represents a separate renewal payment transaction)
  const { data: paymentRecord, error: payErr } = await supabaseAdmin
    .from('payments')
    .insert({
      user_id: dbUserId,
      amount: amount,
      currency: 'INR',
      status: 'completed',
      payment_type: 'subscription',
      razorpay_payment_id,
      razorpay_subscription_id,
      created_at: new Date(paymentEntity.created_at * 1000).toISOString()
    })
    .select()
    .single();

  if (payErr) {
    throw new Error(`Failed to create payment record for charge: ${payErr.message}`);
  }

  // Expire previous subscriptions
  await supabaseAdmin
    .from('subscriptions')
    .update({ payment_status: 'Expired' })
    .eq('user_id', dbUserId)
    .eq('payment_status', 'Completed');

  // Insert or update subscription
  const { data: existingSub } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('razorpay_subscription_id', razorpay_subscription_id)
    .maybeSingle();

  if (existingSub) {
    // Update end date and payment status
    await supabaseAdmin
      .from('subscriptions')
      .update({
        payment_status: 'Completed',
        start_date: start,
        end_date: end,
        razorpay_payment_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingSub.id);
  } else {
    // Insert new subscription record
    await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: dbUserId,
        plan_id: plan.id,
        payment_status: 'Completed',
        start_date: start,
        end_date: end,
        razorpay_payment_id,
        razorpay_subscription_id
      });
  }

  // Map role
  let roleName = 'premium_user';
  if (plan.name.toLowerCase().includes('silver')) roleName = 'silver';
  if (plan.name.toLowerCase().includes('gold')) roleName = 'gold';
  if (plan.name.toLowerCase().includes('platinum')) roleName = 'platinum';

  // Update profiles
  await supabaseAdmin
    .from('profiles')
    .update({ is_premium: true })
    .eq('user_id', dbUserId);

  // Update users role
  await supabaseAdmin
    .from('users')
    .update({ role: roleName })
    .eq('id', dbUserId);

  // Update Auth metadata
  if (authUserId) {
    await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      user_metadata: { role: roleName }
    });
  }

  // Generate invoice and transactions
  const invoiceNum = `GV-INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  await supabaseAdmin
    .from('transactions')
    .insert({
      user_id: dbUserId,
      payment_id: paymentRecord.id,
      invoice_number: invoiceNum,
      amount: amount,
      tax: Number((amount * 0.18).toFixed(2)),
      total_amount: Number((amount * 1.18).toFixed(2)),
      description: `Subscription Charged (Renewal) via Webhook`,
      status: 'completed'
    });

  // User notification
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: dbUserId,
      title: 'Subscription Renewed!',
      message: `Your membership subscription has been successfully renewed. Expires on ${new Date(end).toLocaleDateString()}.`,
      type: 'billing',
      is_read: false
    });
}

async function handleSubscriptionDeactivated(payload: any, eventType: string) {
  const subscriptionEntity = payload.payload.subscription.entity;
  const razorpay_subscription_id = subscriptionEntity.id;

  // Find subscription record in database
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('razorpay_subscription_id', razorpay_subscription_id)
    .maybeSingle();

  if (!subscription) {
    console.warn(`[Webhook Warning] Subscription ${razorpay_subscription_id} not found in database for deactivation`);
    return;
  }

  const dbUserId = subscription.user_id;

  // Determine status (Expired or Failed)
  const statusValue = eventType === 'subscription.halted' ? 'Failed' : 'Expired';

  // Update subscription status
  await supabaseAdmin
    .from('subscriptions')
    .update({
      payment_status: statusValue,
      updated_at: new Date().toISOString()
    })
    .eq('id', subscription.id);

  // Role Downgrade Check:
  // Check if there are OTHER active subscriptions or featured boosts
  const { count: activeSubsCount } = await supabaseAdmin
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', dbUserId)
    .eq('payment_status', 'Completed')
    .gt('end_date', new Date().toISOString());

  const { count: activeFeaturedCount } = await supabaseAdmin
    .from('featured_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', dbUserId)
    .eq('is_active', true)
    .gt('end_date', new Date().toISOString());

  const hasActiveBenefits = (activeSubsCount || 0) > 0 || (activeFeaturedCount || 0) > 0;

  if (!hasActiveBenefits) {
    // Downgrade user role to standard
    await supabaseAdmin
      .from('profiles')
      .update({ is_premium: false })
      .eq('user_id', dbUserId);

    await supabaseAdmin
      .from('users')
      .update({ role: 'user' })
      .eq('id', dbUserId);

    const { data: userRow } = await supabaseAdmin
      .from('users')
      .select('auth_user_id')
      .eq('id', dbUserId)
      .maybeSingle();

    if (userRow?.auth_user_id) {
      await supabaseAdmin.auth.admin.updateUserById(userRow.auth_user_id, {
        user_metadata: { role: 'user' }
      });
    }
  }

  // Set user notification
  let notificationTitle = 'Subscription Expired';
  let notificationMsg = 'Your premium membership subscription has expired. Please renew to continue enjoying premium benefits.';

  if (eventType === 'subscription.halted') {
    notificationTitle = 'Subscription Suspended';
    notificationMsg = 'Your subscription is suspended due to payment failures. Please update your payment method.';
  } else if (eventType === 'subscription.cancelled') {
    notificationTitle = 'Subscription Cancelled';
    notificationMsg = 'Your subscription was cancelled successfully. Premium access will cease immediately.';
  }

  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: dbUserId,
      title: notificationTitle,
      message: notificationMsg,
      type: 'billing',
      is_read: false
    });
}
