'use client';

import { 
  Phone, Mail, ShieldCheck, Award, Star, 
  HelpCircle, CheckCircle, AlertCircle
} from 'lucide-react';

interface VerificationBadgesProps {
  profile: any;
  user?: any;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showUnverified?: boolean;
}

export default function VerificationBadges({
  profile,
  user,
  size = 'md',
  className = '',
  showUnverified = false
}: VerificationBadgesProps) {
  if (!profile) return null;

  // Resolve status fields
  const isPremium = profile.is_premium || profile.isPremium || false;
  
  // ID Verification
  const idStatus = profile.id_verification_status || (profile.is_verified || profile.isVerified ? 'approved' : 'none');
  const isIdVerified = idStatus === 'approved';

  // Horoscope Verification
  const horoscopeStatus = profile.horoscope_verification_status || 'none';
  const isHoroscopeVerified = horoscopeStatus === 'approved';

  // Email and Mobile Verification (can be direct on profile, on user sub-object, or in user prop)
  const isEmailVerified = 
    profile.email_verified || 
    user?.email_verified || 
    profile.users?.email_verified || 
    false;
    
  const isMobileVerified = 
    profile.mobile_verified || 
    user?.mobile_verified || 
    profile.users?.mobile_verified || 
    false;

  // Badge configuration
  const badgesList = [
    {
      id: 'premium',
      active: isPremium,
      label: 'Premium Member',
      icon: Star,
      activeColor: 'from-amber-600 to-yellow-500 text-white shadow-amber-900/10 border-amber-500/30',
      activeBg: 'bg-gradient-to-r from-amber-600 to-yellow-500',
      inactiveColor: 'bg-zinc-800/40 text-zinc-500 border-zinc-850',
      tooltip: 'Premium Member: Active Subscription benefits active'
    },
    {
      id: 'id_proof',
      active: isIdVerified,
      label: 'ID Verified',
      icon: ShieldCheck,
      activeColor: 'from-emerald-600 to-teal-500 text-white shadow-emerald-900/10 border-emerald-500/30',
      activeBg: 'bg-gradient-to-r from-emerald-600 to-teal-500',
      inactiveColor: 'bg-zinc-800/40 text-zinc-500 border-zinc-850',
      tooltip: 'ID Verified: Aadhaar/PAN validation approved'
    },
    {
      id: 'horoscope',
      active: isHoroscopeVerified,
      label: 'Astro Verified',
      icon: Award,
      activeColor: 'from-orange-600 to-amber-550 text-white shadow-orange-950/10 border-orange-500/30',
      activeBg: 'bg-gradient-to-r from-orange-600 to-amber-500',
      inactiveColor: 'bg-zinc-800/40 text-zinc-500 border-zinc-850',
      tooltip: 'Horoscope Verified: Traditional natal chart document approved'
    },
    {
      id: 'mobile',
      active: isMobileVerified,
      label: 'Mobile Verified',
      icon: Phone,
      activeColor: 'from-blue-600 to-cyan-550 text-white shadow-blue-900/10 border-blue-500/30',
      activeBg: 'bg-gradient-to-r from-blue-600 to-cyan-500',
      inactiveColor: 'bg-zinc-800/40 text-zinc-500 border-zinc-850',
      tooltip: 'Mobile Verified: Direct contact details verified'
    },
    {
      id: 'email',
      active: isEmailVerified,
      label: 'Email Verified',
      icon: Mail,
      activeColor: 'from-indigo-600 to-violet-550 text-white shadow-indigo-900/10 border-indigo-500/30',
      activeBg: 'bg-gradient-to-r from-indigo-600 to-violet-550',
      inactiveColor: 'bg-zinc-800/40 text-zinc-500 border-zinc-850',
      tooltip: 'Email Verified: Verified digital identity address'
    }
  ];

  // If size is 'sm', render very compact badges (icon-only)
  if (size === 'sm') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {badgesList.map((badge) => {
          if (!badge.active && !showUnverified) return null;
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className={`p-1.5 rounded-full border transition-all select-none duration-300 relative group cursor-help ${
                badge.active 
                  ? `${badge.activeBg} text-white border-white/10 shadow-sm` 
                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-650 border-zinc-200 dark:border-zinc-800/60 opacity-40'
              }`}
              title={badge.tooltip}
            >
              <Icon className="h-3 w-3" />
              
              {/* Tooltip Overlay */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-zinc-950/90 text-[10px] text-zinc-200 p-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-md leading-normal text-center select-none font-mono">
                {badge.tooltip}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Medium Layout: Labels + Icon, inline wrapping list
  if (size === 'md') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {badgesList.map((badge) => {
          if (!badge.active && !showUnverified) return null;
          const Icon = badge.icon;
          return (
            <div
              key={badge.id}
              className={`px-3 py-1 rounded-full border flex items-center gap-1.5 text-[10px] font-bold tracking-wide uppercase select-none transition-all duration-300 ${
                badge.active
                  ? `bg-gradient-to-r ${badge.activeColor} border shadow-sm`
                  : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-600 opacity-50'
              }`}
              title={badge.tooltip}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{badge.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Large Layout: detailed grid (e.g. for profile verification page)
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {badgesList.map((badge) => {
        const Icon = badge.icon;
        return (
          <div
            key={badge.id}
            className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3 text-left ${
              badge.active
                ? `bg-white dark:bg-zinc-900 border-sandal-200 dark:border-zinc-800/80 shadow-md`
                : 'bg-zinc-50/50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-850 opacity-60'
            }`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${
              badge.active 
                ? `${badge.activeBg} text-white shadow-md` 
                : 'bg-zinc-200 dark:bg-zinc-850 text-zinc-455'
            }`}>
              <Icon className="h-5 w-5" />
            </div>

            <div className="flex flex-col gap-0.5 min-w-0">
              <span className={`text-xs font-bold font-mono tracking-wider uppercase ${
                badge.active ? 'text-zinc-900 dark:text-white' : 'text-zinc-455 dark:text-zinc-500'
              }`}>
                {badge.label}
              </span>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-405 leading-normal font-light">
                {badge.tooltip}
              </p>
              <div className="mt-1.5 flex items-center gap-1">
                {badge.active ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                    <CheckCircle className="h-2.5 w-2.5" /> Approved &amp; Active
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-455 font-semibold uppercase tracking-wider flex items-center gap-0.5">
                    <AlertCircle className="h-2.5 w-2.5" /> Verification Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
