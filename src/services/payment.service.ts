import crypto from 'crypto';
import { razorpayClient, razorpayConfig } from '@/lib/payments/config';

export const paymentService = {
  /**
   * Creates a new Razorpay order.
   * @param amountInInr Amount in Indian Rupees (will be converted to paise).
   * @param receiptId Receipt tracking ID.
   */
  async createOrder(amountInInr: number, receiptId: string) {
    const amountInPaise = Math.round(amountInInr * 100);
    if (razorpayConfig.keyId === 'rzp_test_placeholderid') {
      return {
        order: {
          id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptId,
          status: 'created',
        },
        error: null,
      };
    }
    try {
      const order = await razorpayClient.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
      });
      return { order, error: null };
    } catch (err: any) {
      console.error('Failed to create Razorpay order:', err);
      return { order: null, error: err };
    }
  },

  /**
   * Verifies the client payment signature returned by the Razorpay Checkout form.
   */
  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    if (orderId.startsWith('order_mock_') || razorpayConfig.keyId === 'rzp_test_placeholderid') {
      return signature === `mock_sig_${orderId}_${paymentId}`;
    }
    try {
      const generatedSignature = crypto
        .createHmac('sha256', razorpayConfig.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
      return generatedSignature === signature;
    } catch (err) {
      console.error('Signature verification failed:', err);
      return false;
    }
  },

  /**
   * Verifies the signature header for incoming Razorpay webhooks.
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', razorpayConfig.webhookSecret)
        .update(rawBody)
        .digest('hex');
      return expectedSignature === signature;
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return false;
    }
  }
};
export type PaymentService = typeof paymentService;
