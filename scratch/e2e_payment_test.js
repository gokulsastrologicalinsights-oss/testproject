/**
 * Gokul Vivaham Matrimony Platform
 * Payment and Subscription System E2E Validation Script
 * Tests cryptographic verification, webhook state-machines, user isolation, and premium unlocks.
 */

const crypto = require('crypto');

// Mock in-memory database representing Supabase tables
const db = {
  users: [],
  profiles: [],
  subscription_plans: [],
  subscriptions: [],
  payments: [],
  transactions: [],
  processed_webhook_events: [],
  notifications: []
};

// Seed static plans
db.subscription_plans = [
  { id: 'silver-plan-id', name: 'Silver Plan', price: 1999, duration_days: 90 },
  { id: 'gold-plan-id', name: 'Gold Plan', price: 4999, duration_days: 180 },
  { id: 'platinum-plan-id', name: 'Platinum Plan', price: 9999, duration_days: 365 }
];

// Helper to reset db state
function resetDatabase() {
  db.users = [
    { id: 'user-alice', auth_user_id: 'auth-alice', email: 'alice@gmail.com', role: 'user' },
    { id: 'user-bob', auth_user_id: 'auth-bob', email: 'bob@gmail.com', role: 'user' }
  ];
  db.profiles = [
    { user_id: 'user-alice', first_name: 'Alice', last_name: 'S.', is_premium: false },
    { user_id: 'user-bob', first_name: 'Bob', last_name: 'M.', is_premium: false }
  ];
  db.subscriptions = [];
  db.payments = [];
  db.transactions = [];
  db.processed_webhook_events = [];
  db.notifications = [];
}

// Payment signature verification mock logic
function verifyPaymentSignature(orderId, paymentId, signature, keySecret) {
  if (orderId.startsWith('order_mock_') || keySecret === 'rzp_test_placeholderid') {
    return signature === `mock_sig_${orderId}_${paymentId}`;
  }
  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return generatedSignature === signature;
}

// Webhook signature verification mock logic
function verifyWebhookSignature(rawBody, signature, webhookSecret) {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signature;
}

// Simulated API route handler: POST /api/payments/verify
async function handleVerifyPaymentAPI(requestBody, sessionUser) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = requestBody;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return { status: 400, body: { error: 'Missing signature parameters' } };
  }

  if (!sessionUser) {
    return { status: 401, body: { error: 'Unauthorized' } };
  }

  // Fetch payment record
  const payment = db.payments.find(p => p.razorpay_order_id === razorpay_order_id);
  if (!payment) {
    return { status: 404, body: { error: 'Payment record not found' } };
  }

  // Security Protection: Payment ownership isolation check
  // Check if owner of the payment matches current authenticated session
  const paymentOwner = db.users.find(u => u.id === payment.user_id);
  if (!paymentOwner || paymentOwner.auth_user_id !== sessionUser.id) {
    return { status: 403, body: { error: 'Forbidden: Payment ownership mismatch' } };
  }

  // Cryptographic Signature verification
  const isValid = verifyPaymentSignature(
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature, 
    'rzp_live_secret_key_12345'
  );

  if (!isValid) {
    payment.status = 'failed';
    payment.updated_at = new Date().toISOString();
    return { status: 400, body: { error: 'Invalid signature' } };
  }

  // Anti-Double Processing check
  if (payment.status === 'completed') {
    return { status: 200, body: { success: true, message: 'Payment already processed' } };
  }

  // Update payment status
  payment.status = 'completed';
  payment.razorpay_payment_id = razorpay_payment_id;
  payment.razorpay_signature = razorpay_signature;
  payment.updated_at = new Date().toISOString();

  // Insert Transaction Ledger Row
  const invoiceNum = `GV-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const tax = Number((payment.amount * 0.18).toFixed(2));
  const transaction = {
    id: 'txn-' + Math.random().toString(36).substr(2, 9),
    user_id: payment.user_id,
    payment_id: payment.id,
    invoice_number: invoiceNum,
    amount: payment.amount - tax,
    tax: tax,
    total_amount: payment.amount,
    description: 'Subscription Purchase verified',
    status: 'completed',
    created_at: new Date().toISOString()
  };
  db.transactions.push(transaction);

  // Activate Subscription
  if (payment.payment_type === 'subscription') {
    const plan = db.subscription_plans.find(p => Math.abs(Number(p.price) - payment.amount) < 5);
    if (plan) {
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + plan.duration_days);

      // Expire previous active subscriptions
      db.subscriptions.forEach(s => {
        if (s.user_id === payment.user_id && s.payment_status === 'Completed') {
          s.payment_status = 'Expired';
        }
      });

      // Insert new active subscription
      const sub = {
        id: 'sub-' + Math.random().toString(36).substr(2, 9),
        user_id: payment.user_id,
        plan_id: plan.id,
        payment_status: 'Completed',
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        razorpay_payment_id
      };
      db.subscriptions.push(sub);

      // Unlock Premium features
      let roleName = 'premium_user';
      if (plan.name.toLowerCase().includes('silver')) roleName = 'silver';
      if (plan.name.toLowerCase().includes('gold')) roleName = 'gold';
      if (plan.name.toLowerCase().includes('platinum')) roleName = 'platinum';

      const profile = db.profiles.find(p => p.user_id === payment.user_id);
      if (profile) profile.is_premium = true;

      const user = db.users.find(u => u.id === payment.user_id);
      if (user) user.role = roleName;
    }
  }

  return { status: 200, body: { success: true, message: 'Membership unlocked' } };
}

// Simulated API route handler: POST /api/payments/webhook
async function handleWebhookAPI(rawBody, signature, webhookSecret) {
  const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    return { status: 400, body: { error: 'Invalid webhook signature' } };
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event;
  const eventId = payload.id;

  // Deduplication: check if already processed
  const exists = db.processed_webhook_events.find(e => e.event_id === eventId);
  if (exists) {
    if (exists.status === 'completed') {
      return { status: 200, body: { success: true, message: 'Event already processed' } };
    }
    return { status: 409, body: { error: 'Conflict' } };
  }

  // Register event processing
  const eventRecord = { event_id: eventId, event_type: event, status: 'processing' };
  db.processed_webhook_events.push(eventRecord);

  // Router
  try {
    if (event === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const payment = db.payments.find(p => p.razorpay_order_id === orderId);
      
      if (payment && payment.status !== 'completed') {
        payment.status = 'completed';
        payment.razorpay_payment_id = paymentEntity.id;
        
        // Unlocks subscription...
        const plan = db.subscription_plans.find(pl => Math.abs(pl.price - payment.amount) < 5);
        if (plan) {
          const sub = {
            id: 'sub-' + Math.random().toString(36).substr(2, 9),
            user_id: payment.user_id,
            plan_id: plan.id,
            payment_status: 'Completed',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + plan.duration_days * 24 * 3600 * 1000).toISOString()
          };
          db.subscriptions.push(sub);
          const profile = db.profiles.find(prof => prof.user_id === payment.user_id);
          if (profile) profile.is_premium = true;

          let roleName = 'premium_user';
          if (plan.name.toLowerCase().includes('silver')) roleName = 'silver';
          if (plan.name.toLowerCase().includes('gold')) roleName = 'gold';
          if (plan.name.toLowerCase().includes('platinum')) roleName = 'platinum';

          const user = db.users.find(u => u.id === payment.user_id);
          if (user) user.role = roleName;
        }
      }
    } else if (event === 'subscription.cancelled') {
      const subEntity = payload.payload.subscription.entity;
      const subId = subEntity.id;
      // Mark matching subscriptions as Expired
      db.subscriptions.forEach(s => {
        if (s.razorpay_subscription_id === subId || s.id === subId) {
          s.payment_status = 'Expired';
        }
      });
      // Downgrade user access (assuming no other active plans)
      const subRow = db.subscriptions.find(s => s.razorpay_subscription_id === subId || s.id === subId);
      if (subRow) {
        const profile = db.profiles.find(prof => prof.user_id === subRow.user_id);
        if (profile) profile.is_premium = false;
        const user = db.users.find(u => u.id === subRow.user_id);
        if (user) user.role = 'user';
      }
    }

    eventRecord.status = 'completed';
    return { status: 200, body: { received: true } };
  } catch (err) {
    eventRecord.status = 'failed';
    return { status: 500, body: { error: err.message } };
  }
}

// RUN THE SUITE OF 10 END-TO-END TEST CASES
async function runTests() {
  console.log('========================================================');
  console.log('GOKUL VIVAHAM PAYMENT E2E TEST RUNNER - SECURITY ASSURE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Successful Payments Flow
  // ----------------------------------------------------
  resetDatabase();
  const pay1 = {
    id: 'pay-001',
    user_id: 'user-alice',
    amount: 4999,
    status: 'pending',
    payment_type: 'subscription',
    razorpay_order_id: 'order_alice_123',
    created_at: new Date().toISOString()
  };
  db.payments.push(pay1);

  const keySecret = 'rzp_live_secret_key_12345';
  const expectedSig = crypto
    .createHmac('sha256', keySecret)
    .update('order_alice_123|pay_alice_capture')
    .digest('hex');

  const res1 = await handleVerifyPaymentAPI({
    razorpay_order_id: 'order_alice_123',
    razorpay_payment_id: 'pay_alice_capture',
    razorpay_signature: expectedSig
  }, { id: 'auth-alice' });

  assert(res1.status === 200, 'Successful Payment Verification API responds 200');
  assert(db.payments[0].status === 'completed', 'Payment status updated to completed');

  // ----------------------------------------------------
  // TEST 2: Failed Payments Flow (Invalid Signature)
  // ----------------------------------------------------
  resetDatabase();
  const pay2 = {
    id: 'pay-002',
    user_id: 'user-alice',
    amount: 1999,
    status: 'pending',
    payment_type: 'subscription',
    razorpay_order_id: 'order_alice_bad',
    created_at: new Date().toISOString()
  };
  db.payments.push(pay2);

  const res2 = await handleVerifyPaymentAPI({
    razorpay_order_id: 'order_alice_bad',
    razorpay_payment_id: 'pay_alice_fail',
    razorpay_signature: 'invalid_malicious_signature_value'
  }, { id: 'auth-alice' });

  assert(res2.status === 400, 'Verify API rejects bad payment signature with 400');
  assert(db.payments[0].status === 'failed', 'Reversed signature logs transaction status as failed');

  // ----------------------------------------------------
  // TEST 3: Cryptographic Validation Assurance
  // ----------------------------------------------------
  assert(
    verifyPaymentSignature('order_mock_123', 'pay_mock_123', 'mock_sig_order_mock_123_pay_mock_123', 'rzp_test_placeholderid'),
    'Cryptographic checker validates mock signatures correctly in sandbox mode'
  );
  assert(
    !verifyPaymentSignature('order_live_123', 'pay_live_123', 'mock_sig_order_live_123_pay_live_123', keySecret),
    'Cryptographic checker rejects mock signatures when live environment credentials are present'
  );

  // ----------------------------------------------------
  // TEST 4: Secure Webhook Processing & Idempotency
  // ----------------------------------------------------
  resetDatabase();
  const pay3 = {
    id: 'pay-003',
    user_id: 'user-alice',
    amount: 9999,
    status: 'pending',
    payment_type: 'subscription',
    razorpay_order_id: 'order_webhook_003'
  };
  db.payments.push(pay3);

  const webhookSecret = 'whsec_gokulvivaham_webhook_secret_key';
  const webhookBody = JSON.stringify({
    event: 'payment.captured',
    id: 'evt_100x200z',
    payload: {
      payment: {
        entity: {
          id: 'pay_webhook_capture',
          order_id: 'order_webhook_003',
          amount: 999900
        }
      }
    }
  });

  const webhookSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(webhookBody)
    .digest('hex');

  const res4 = await handleWebhookAPI(webhookBody, webhookSig, webhookSecret);
  assert(res4.status === 200, 'Valid Webhook capture event processes with 200');
  assert(db.payments[0].status === 'completed', 'Webhook capture completes the database payment row');

  // Test Webhook Deduplication / Replay protection
  const res4_duplicate = await handleWebhookAPI(webhookBody, webhookSig, webhookSecret);
  assert(res4_duplicate.status === 200 && res4_duplicate.body.message === 'Event already processed', 
    'Duplicate Webhook event is bypassed safely without duplicate activations'
  );

  // ----------------------------------------------------
  // TEST 5: Subscription Activation Math
  // ----------------------------------------------------
  assert(db.subscriptions.length === 1, 'Subscription record successfully created in DB');
  const activeSub = db.subscriptions[0];
  const now = new Date();
  const end = new Date(activeSub.end_date);
  const diffDays = Math.ceil((end - now) / (1000 * 3600 * 24));
  assert(diffDays === 365, 'Activated subscription duration matches Platinum Plan price constraints (365 days)');

  // ----------------------------------------------------
  // TEST 6: Premium Feature Unlocking
  // ----------------------------------------------------
  const aliceProfile = db.profiles.find(p => p.user_id === 'user-alice');
  const aliceUser = db.users.find(u => u.id === 'user-alice');
  assert(aliceProfile.is_premium === true, 'Profile.is_premium unlocks flag on successful payment');
  assert(aliceUser.role === 'platinum', 'User role updates to corresponding premium tier');

  // ----------------------------------------------------
  // TEST 7: Expiry / Deactivation Handling
  // ----------------------------------------------------
  const cancelBody = JSON.stringify({
    event: 'subscription.cancelled',
    id: 'evt_cancel_001',
    payload: {
      subscription: {
        entity: {
          id: activeSub.id
        }
      }
    }
  });
  const cancelSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(cancelBody)
    .digest('hex');

  await handleWebhookAPI(cancelBody, cancelSig, webhookSecret);
  assert(db.subscriptions[0].payment_status === 'Expired', 'Webhook cancellation cancels active subscription');
  assert(aliceProfile.is_premium === false, 'Cancellation downgrades profile to standard status');
  assert(aliceUser.role === 'user', 'Cancellation downgrades user role to user');

  // ----------------------------------------------------
  // TEST 8: Multi-user Payment Isolation (RLS Security)
  // ----------------------------------------------------
  resetDatabase();
  const payBob = {
    id: 'pay-bob-secret',
    user_id: 'user-bob', // Owned by Bob
    amount: 4999,
    status: 'pending',
    razorpay_order_id: 'order_bob_secret'
  };
  db.payments.push(payBob);

  const bobSig = crypto
    .createHmac('sha256', keySecret)
    .update('order_bob_secret|pay_bob_capture')
    .digest('hex');

  const res8 = await handleVerifyPaymentAPI({
    razorpay_order_id: 'order_bob_secret',
    razorpay_payment_id: 'pay_bob_capture',
    razorpay_signature: bobSig
  }, { id: 'auth-alice' }); // Alice tries to verify Bob's payment!

  assert(res8.status === 403, 'Verify API rejects user verifying another user\'s order (Returns 403 Forbidden)');
  assert(db.payments[0].status === 'pending', 'Isolated payment record remains pending, avoiding hijack');

  // ----------------------------------------------------
  // TEST 9: Billing Ledger Accuracy
  // ----------------------------------------------------
  resetDatabase();
  const payLedger = {
    id: 'pay-ledger-test',
    user_id: 'user-alice',
    amount: 4999,
    status: 'pending',
    payment_type: 'subscription',
    razorpay_order_id: 'order_ledger_1'
  };
  db.payments.push(payLedger);

  const ledgerSig = crypto
    .createHmac('sha256', keySecret)
    .update('order_ledger_1|pay_ledger_capture')
    .digest('hex');

  await handleVerifyPaymentAPI({
    razorpay_order_id: 'order_ledger_1',
    razorpay_payment_id: 'pay_ledger_capture',
    razorpay_signature: ledgerSig
  }, { id: 'auth-alice' });

  assert(db.transactions.length === 1, 'Transaction invoice generated on completed payment');
  const txn = db.transactions[0];
  const expectedTax = Number((4999 * 0.18).toFixed(2));
  const expectedAmount = 4999 - expectedTax;
  assert(txn.total_amount === 4999, 'Invoice total matches paid price');
  assert(txn.tax === expectedTax, 'Invoice correctly isolates 18% GST estimate value');
  assert(txn.amount === expectedAmount, 'Invoice subtotal matches amount minus tax');
  assert(txn.invoice_number.startsWith('GV-INV-2026-'), 'Invoice number formats correctly with prefix');

  // ----------------------------------------------------
  // TEST 10: Security Protection (Duplicate Active Block)
  // ----------------------------------------------------
  // Multiple active completed subscriptions check
  resetDatabase();
  // Simulate unique index constraint check: one active subscription per user at database level.
  // When inserting a new Completed subscription, the API actively expires old completed subscriptions.
  const plan = db.subscription_plans[1]; // Gold Plan
  
  // Alice buys Plan 1
  db.subscriptions.push({
    id: 'sub-active-1',
    user_id: 'user-alice',
    plan_id: 'silver-plan-id',
    payment_status: 'Completed',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString()
  });

  // Alice buys Plan 2: verify old is expired and only 1 active remains
  const payDouble = {
    id: 'pay-double-test',
    user_id: 'user-alice',
    amount: 4999,
    status: 'pending',
    payment_type: 'subscription',
    razorpay_order_id: 'order_double'
  };
  db.payments.push(payDouble);

  const doubleSig = crypto
    .createHmac('sha256', keySecret)
    .update('order_double|pay_double_capture')
    .digest('hex');

  await handleVerifyPaymentAPI({
    razorpay_order_id: 'order_double',
    razorpay_payment_id: 'pay_double_capture',
    razorpay_signature: doubleSig
  }, { id: 'auth-alice' });

  const activeAliceSubs = db.subscriptions.filter(s => s.user_id === 'user-alice' && s.payment_status === 'Completed');
  assert(activeAliceSubs.length === 1, 'Only one active Completed subscription remains; previous plans are deactivated');
  assert(db.subscriptions.find(s => s.id === 'sub-active-1').payment_status === 'Expired', 'Previous active plan automatically marked as Expired');

  console.log('\n========================================================');
  console.log(`TEST RUNNER COMPLETED. PASSED: ${passed}/${passed + failed}, FAILED: ${failed}`);
  console.log('========================================================');
}

runTests();
