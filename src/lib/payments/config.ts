import Razorpay from 'razorpay';
import { z } from 'zod';

const razorpayEnvSchema = z.object({
  RAZORPAY_KEY_ID: z.string().min(1, 'RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(1, 'RAZORPAY_KEY_SECRET is required'),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'RAZORPAY_WEBHOOK_SECRET is required'),
});

// Environment check to make sure secrets are server-side only
if (typeof window !== 'undefined') {
  throw new Error('Razorpay configuration should only be loaded on the server-side.');
}

const parsedEnv = razorpayEnvSchema.safeParse({
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
});

if (!parsedEnv.success) {
  const errorMsg = 'Razorpay Config Validation Error:\n' + 
    parsedEnv.error.issues.map(issue => ` - ${issue.path.join('.')}: ${issue.message}`).join('\n');
  console.warn(errorMsg);
  
  // Log warning and only throw in production if not building/running on Vercel
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    throw new Error(errorMsg);
  }
}

export const razorpayConfig = {
  keyId: parsedEnv.data?.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholderid',
  keySecret: parsedEnv.data?.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || 'placeholdersecret',
  webhookSecret: parsedEnv.data?.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholderwebhooksecret',
};

export const razorpayClient = new Razorpay({
  key_id: razorpayConfig.keyId,
  key_secret: razorpayConfig.keySecret,
});
