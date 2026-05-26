'use client';

import Link from 'next/link';
import { CheckCircle2, Star, MessageCircle } from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import AstroMatcher from '@/components/home/AstroMatcher';
import SuccessStories from '@/components/home/SuccessStories';
import FaqSection from '@/components/home/FaqSection';

export default function Home() {
  return (
    <div className="flex flex-col w-full relative">
      
      {/* HERO SECTION */}
      <HeroSection />

      {/* CORE VALUE PROPOSITIONS */}
      <WhyChooseUs />

      {/* INTERACTIVE COMPATIBILITY CHECKER */}
      <AstroMatcher />

      {/* MEMBERSHIP PLANS */}
      <section className="w-full py-16 bg-white dark:bg-zinc-950 border-t border-sandal-200/40 dark:border-zinc-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col gap-12">
          
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
              Premium Membership Plans
            </h2>
            <div className="w-20 h-1 luxury-gradient rounded-full" />
            <p className="text-base text-zinc-650 dark:text-zinc-400 max-w-xl font-light">
              Elevate your profile, unlock contact info, and initiate direct chats to fast-track your partner search.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Plan 1 */}
            <div className="flex flex-col p-8 rounded-3xl bg-sandal-50/30 dark:bg-zinc-900/30 border border-sandal-200/40 dark:border-zinc-800/50 text-left hover:scale-[1.02] transition-transform duration-300">
              <h3 className="text-xl font-serif font-bold text-zinc-850 dark:text-zinc-205">Free Starter</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-serif font-extrabold text-zinc-900 dark:text-zinc-100">₹0</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-405 pl-1">/ lifetime</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-405 mt-2">Get started with basic registration and search.</p>
              
              <ul className="mt-6 space-y-3.5 text-sm text-zinc-600 dark:text-zinc-405">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-maroon-500 shrink-0" /> Create detailed profile
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-maroon-500 shrink-0" /> Search & filter matches
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-maroon-500 shrink-0" /> Express interest (5/day)
                </li>
                <li className="flex items-center gap-2 text-zinc-405 line-through">
                  View verified phone numbers
                </li>
              </ul>
              
              <Link 
                href="/register" 
                className="mt-8 w-full py-2.5 rounded-full border border-maroon-500/30 text-center text-sm font-semibold text-maroon-700 dark:text-gold-450 hover:bg-maroon-500/5 transition-all"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Plan 2 */}
            <div className="flex flex-col p-8 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-gold-400 shadow-xl relative text-left hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 px-3 py-1 rounded-full luxury-gradient text-[10px] font-bold text-white uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                Gold Elite <Star className="h-4 w-4 text-gold-550 fill-gold-550" />
              </h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-serif font-extrabold text-zinc-900 dark:text-zinc-100">₹4,999</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-405 pl-1">/ 3 months</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-405 mt-2">Perfect balance of compatibility searches and contacts.</p>
              
              <ul className="mt-6 space-y-3.5 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gold-550 shrink-0" /> Everything in Free
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gold-550 shrink-0" /> View 30 verified phone numbers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gold-550 shrink-0" /> Unlimited interest requests
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gold-550 shrink-0" /> Direct chat matches
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-gold-550 shrink-0" /> Highlighted profile listing
                </li>
              </ul>
              
              <Link 
                href="/register" 
                className="mt-8 w-full py-2.5 rounded-full luxury-gradient text-white text-center text-sm font-semibold hover:opacity-90 shadow-md transition-all"
              >
                Go Gold Elite
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="flex flex-col p-8 rounded-3xl bg-sandal-50/30 dark:bg-zinc-900/30 border border-sandal-200/40 dark:border-zinc-800/50 text-left hover:scale-[1.02] transition-transform duration-300">
              <h3 className="text-xl font-serif font-bold text-zinc-855 dark:text-zinc-200">Diamond Premium</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-serif font-extrabold text-zinc-900 dark:text-zinc-100">₹8,999</span>
                <span className="text-sm text-zinc-500 dark:text-zinc-405 pl-1">/ 6 months</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-405 mt-2">Maximum exposure and dedicated astro support.</p>
              
              <ul className="mt-6 space-y-3.5 text-sm text-zinc-650 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-maroon-550 shrink-0" /> Everything in Gold
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-maroon-555 shrink-0" /> View 80 verified phone numbers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-maroon-555 shrink-0" /> Astro matching assistance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-maroon-555 shrink-0" /> Dedicated relationship manager
                </li>
              </ul>
              
              <Link 
                href="/register" 
                className="mt-8 w-full py-2.5 rounded-full border border-maroon-500/30 text-center text-sm font-semibold text-maroon-700 dark:text-gold-450 hover:bg-maroon-500/5 transition-all"
              >
                Go Diamond Premium
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* SUCCESS STORIES */}
      <SuccessStories />

      {/* FAQ SECTION */}
      <FaqSection />

      {/* WHATSAPP CTA FLT BUTTON */}
      <a
        href="https://wa.me/919876543210?text=Hello!%20I'm%20interested%20in%20knowing%20more%20about%20Gokul%20Vivaham%2520Matrimony."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl hover:scale-105 transition-all duration-300"
        title="WhatsApp Support"
      >
        <MessageCircle className="h-6 w-6 fill-white text-emerald-600" />
        <span className="hidden sm:inline text-xs font-bold pr-2">Live Support</span>
      </a>

    </div>
  );
}
