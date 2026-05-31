/**
 * Unified subscription plans and pricing constants for Gokul Vivaham Matrimony.
 * Plan IDs correspond directly to the seed records in public.subscription_plans.
 */

export const CURRENCY = 'INR';
export const GST_RATE_PERCENTAGE = 18;

export const FEATURED_PROFILE_PRICES = {
  DAYS_15: 799,
  DAYS_30: 1499,
};

export const CONSULTATION_PRICE = 999;

export interface SubscriptionPlanDef {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  role: string;
  features: {
    chat_access: boolean;
    contact_viewing: boolean;
    interests_daily: number;
    advanced_filters: boolean;
    priority_support: boolean;
    profile_boosting: boolean;
    profile_views_daily: number;
    horoscope_compatibility: boolean;
  };
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlanDef> = {
  FREE: {
    id: '0ffd3070-7aba-4554-8790-93c76b318df6',
    name: 'Free Plan',
    price: 0,
    durationDays: 3650,
    role: 'user',
    features: {
      chat_access: false,
      contact_viewing: false,
      interests_daily: 3,
      advanced_filters: false,
      priority_support: false,
      profile_boosting: false,
      profile_views_daily: 5,
      horoscope_compatibility: false,
    },
  },
  SILVER: {
    id: '5d75dd4e-9e27-45aa-b9f5-0a71ff6327cf',
    name: 'Silver Plan',
    price: 1999,
    durationDays: 90,
    role: 'silver',
    features: {
      chat_access: true,
      contact_viewing: true,
      interests_daily: 20,
      advanced_filters: false,
      priority_support: false,
      profile_boosting: false,
      profile_views_daily: 50,
      horoscope_compatibility: false,
    },
  },
  GOLD: {
    id: 'd50e37d5-21df-454b-8ed8-0e7ddb33827c',
    name: 'Gold Plan',
    price: 4999,
    durationDays: 180,
    role: 'gold',
    features: {
      chat_access: true,
      contact_viewing: true,
      interests_daily: 50,
      advanced_filters: true,
      priority_support: false,
      profile_boosting: false,
      profile_views_daily: 150,
      horoscope_compatibility: true,
    },
  },
  PLATINUM: {
    id: 'b987dc02-0102-4279-b787-50987762532b',
    name: 'Platinum Plan',
    price: 9999,
    durationDays: 365,
    role: 'platinum',
    features: {
      chat_access: true,
      contact_viewing: true,
      interests_daily: 1000,
      advanced_filters: true,
      priority_support: true,
      profile_boosting: true,
      profile_views_daily: 1000,
      horoscope_compatibility: true,
    },
  },
};
