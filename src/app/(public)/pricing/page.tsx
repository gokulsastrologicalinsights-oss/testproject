'use client';

import Link from 'next/link';
import { Check, Star, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'Free Basic',
      price: '₹0',
      period: 'lifetime',
      desc: 'Build your profile and search matching candidates.',
      features: [
        'Detailed Profile Creation',
        'Advanced Search Filters',
        'Express interest (5 / day)',
        'Receive match requests',
        'Horoscope Uploading'
      ],
      missing: [
        'View Verified Phone Numbers',
        'Direct Chat Integration',
        'Astro compatibility correction assistance',
        'Dedicated Matchmaking Manager'
      ],
      btnText: 'Register Free',
      btnHref: '/register',
      popular: false
    },
    {
      name: 'Gold Elite',
      price: '₹4,999',
      period: '3 months',
      desc: 'Connect directly and view verified phone contacts.',
      features: [
        'Everything in Free Basic',
        'View 30 Verified Contacts',
        'Unlimited Express Interests',
        'Direct Chat with compatible matches',
        'Profile Highlighted listing',
        'Access matched horoscopes PDF'
      ],
      missing: [
        'Astro compatibility correction assistance',
        'Dedicated Matchmaking Manager'
      ],
      btnText: 'Go Gold Elite',
      btnHref: '/register',
      popular: true
    },
    {
      name: 'Diamond Premium',
      price: '₹8,999',
      period: '6 months',
      desc: 'Full astrological review and dedicated matchmaking agent.',
      features: [
        'Everything in Gold Elite',
        'View 80 Verified Contacts',
        'Dedicated Matchmaking Manager',
        'Astro compatibility assistance',
        'Premium Customer Support',
        'Direct family meet setup assistance'
      ],
      missing: [],
      btnText: 'Unlock Diamond Premium',
      btnHref: '/register',
      popular: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-left flex flex-col gap-10">
      
      {/* Title */}
      <div className="flex flex-col items-center text-center gap-3">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
          Membership Packages
        </h1>
        <span className="text-xs font-semibold text-gold-600 dark:text-gold-400 uppercase tracking-widest leading-none">
          Choose a Plan and Connect with Compatibility
        </span>
        <div className="w-16 h-0.5 bg-gold-500 rounded-full mt-2" />
      </div>

      {/* Plans Card Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mt-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 flex flex-col justify-between relative shadow-xl hover:scale-[1.01] transition-transform duration-300 ${
              plan.popular 
                ? 'border-2 border-gold-500 ring-4 ring-gold-500/10' 
                : 'border border-sandal-200 dark:border-zinc-800'
            }`}
          >
            {plan.popular && (
              <span className="absolute top-0 right-8 transform -translate-y-1/2 px-3 py-1 bg-gold-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                Most Popular
              </span>
            )}

            <div>
              <h3 className="text-xl font-serif font-bold text-zinc-850 dark:text-zinc-100 flex items-center gap-1.5">
                {plan.name}
                {plan.popular && <Star className="h-4 w-4 text-gold-500 fill-gold-500" />}
              </h3>
              
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-serif font-extrabold text-zinc-900 dark:text-white">{plan.price}</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 pl-1">/ {plan.period}</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed font-light">{plan.desc}</p>
              
              <div className="h-px bg-zinc-100 dark:bg-zinc-850 my-6" />

              {/* Features List */}
              <ul className="space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-zinc-650 dark:text-zinc-450 leading-normal font-light">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
                {plan.missing.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-zinc-400 dark:text-zinc-600 leading-normal font-light line-through">
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-850">
              <Link
                href={plan.btnHref}
                className={`block w-full py-2.5 rounded-full text-center text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                  plan.popular
                    ? 'luxury-gradient text-white hover:opacity-95'
                    : 'border border-maroon-500/20 text-maroon-700 dark:text-gold-450 hover:bg-maroon-500/5'
                }`}
              >
                {plan.btnText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Badges */}
      <div className="mt-8 p-6 rounded-3xl bg-sandal-50/30 dark:bg-zinc-900/50 border border-sandal-200/40 dark:border-zinc-800/80 text-center flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">100% Secure Checkout</span>
            <span className="text-xs text-zinc-450 dark:text-zinc-550">Transactions encrypted using 256-bit SSL safeguards</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-400 tracking-wider">
          <span>Razorpay SECURE</span>
          <span>•</span>
          <span>UPI / GPay</span>
          <span>•</span>
          <span>All major Debit / Credit cards</span>
        </div>
      </div>

    </div>
  );
}
