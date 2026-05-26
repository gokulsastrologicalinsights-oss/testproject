export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Starter',
    price: 0,
    duration: 'lifetime',
    features: [
      'Create detailed profile',
      'Search & filter matches',
      'Express interest (5/day)',
      'Basic compatibility summary',
    ],
  },
  GOLD: {
    id: 'gold',
    name: 'Gold Elite',
    price: 4999,
    duration: '3 months',
    features: [
      'Everything in Free',
      'View 30 verified phone numbers',
      'Unlimited interest requests',
      'Direct chat matches',
      'Highlighted profile listing',
    ],
  },
  DIAMOND: {
    id: 'diamond',
    name: 'Diamond Premium',
    price: 8999,
    duration: '6 months',
    features: [
      'Everything in Gold',
      'View 80 verified phone numbers',
      'Astro matching assistance',
      'Dedicated relationship manager',
      'Premium match badge',
    ],
  },
};
