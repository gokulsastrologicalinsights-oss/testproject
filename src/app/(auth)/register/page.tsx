'use client';

import { Heart, ShieldCheck, CheckCircle2, Sparkles, UserPlus } from 'lucide-react';
import RegisterStepper from '@/components/register/RegisterStepper';
import { SupportSection } from '@/components/contact/SupportSection';

export default function RegisterPage() {
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-80px)] w-full">
      
      {/* LEFT COLUMN: BRANDING & TRUST (Desktop Only) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-maroon-700 via-maroon-800 to-maroon-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full border border-gold-500/10" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full border border-gold-500/10" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-gold-400 rounded-full animate-ping" />

        {/* Branding header */}
        <div className="flex flex-col gap-1.5 z-10 text-left">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-gold-400 fill-gold-400" />
            <span className="text-2xl font-serif font-bold text-gold-400">Gokul Vivaham</span>
          </div>
          <span className="text-xs font-semibold text-gold-200 pl-8 tracking-widest uppercase">
            கோகுல் விவாகம்
          </span>
        </div>

        {/* Dynamic Trust Text */}
        <div className="flex flex-col gap-6 my-auto z-10 max-w-sm text-left">
          <span className="text-xs font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
            <UserPlus className="h-4 w-4 text-gold-400" />
            Begin Your Journey
          </span>
          <h2 className="text-4xl font-serif font-bold leading-tight">
            Find Your Perfect South Indian Match
          </h2>
          <p className="text-sm text-maroon-100 font-light leading-relaxed">
            Create a comprehensive matrimony profile in 5 simple steps. Tell us about your background, education, horoscope details, and partner preferences to calculate instant compatibility scores.
          </p>
        </div>

        {/* Trust factors */}
        <div className="flex flex-col gap-3.5 z-10 pt-6 border-t border-maroon-600/50 text-sm text-maroon-100 text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gold-400 shrink-0" />
            <span>Secure 5-Step Stepper Verification</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-gold-400 shrink-0" />
            <span>Integrated Horoscope Matching & Astro Support</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: REGISTER MULTI-STEP FORM CONTAINER */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 bg-sandal-50/20 dark:bg-zinc-950/20 w-full overflow-y-auto gap-6">
        <div className="w-full max-w-3xl">
          <RegisterStepper />
        </div>
        <div className="w-full max-w-3xl">
          <SupportSection compact />
        </div>
      </div>

    </div>
  );
}
