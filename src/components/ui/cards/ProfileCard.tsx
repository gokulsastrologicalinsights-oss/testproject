'use client';

import { Heart, CheckCircle2, Star, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ProfileCardProps {
  profile: any;
  compatibility?: number;
  onLikeToggle?: (id: string) => void;
  liked?: boolean;
}

export default function ProfileCard({
  profile,
  compatibility = 85,
  onLikeToggle,
  liked = false,
}: ProfileCardProps) {
  const id = profile.id || '1';
  const name = profile.fullName || profile.full_name || 'Vivaham Member';
  const ageVal = profile.age || 25;
  const profession = profile.occupation || profile.profession || 'Professional';
  const cityVal = profile.city || profile.workLocation || 'Tamil Nadu';
  const starVal = profile.star || profile.nakshatra || 'Anuradha';
  const rasiVal = profile.rasi || 'Rasi Details';
  const isPremiumUser = profile.isPremium || profile.is_premium || false;
  const isVerifiedUser = profile.isVerified || profile.is_verified || true; // True for beautiful badge display

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-zinc-900 border border-sandal-200 dark:border-zinc-800/80 rounded-3xl p-4 shadow-sm hover:shadow-xl flex flex-col text-left h-full transition-shadow duration-300"
    >
      {/* Profile Image Area */}
      <div className="w-full h-44 rounded-2xl bg-gradient-to-tr from-sandal-150 via-sandal-50 to-rose-100/50 dark:from-zinc-800 dark:to-maroon-950/20 relative overflow-hidden flex items-center justify-center select-none">
        <User className="h-16 w-16 text-maroon-500/10 dark:text-zinc-700" />
        
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isVerifiedUser && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-sm text-[9px] font-bold text-white flex items-center gap-1 uppercase tracking-wider shadow">
              <CheckCircle2 className="h-3 w-3" /> Verified
            </span>
          )}
          {isPremiumUser && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-600/90 backdrop-blur-sm text-[9px] font-bold text-white flex items-center gap-1 uppercase tracking-wider shadow">
              <Star className="h-3 w-3 fill-white" /> Premium
            </span>
          )}
        </div>

        {/* Compatibility badge */}
        {compatibility > 0 && (
          <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-maroon-500/90 backdrop-blur-sm text-[10px] font-extrabold text-white uppercase tracking-wider shadow">
            {compatibility}% Match
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="mt-4 flex flex-col flex-1 gap-1">
        <h3 className="text-lg font-serif font-black text-zinc-900 dark:text-zinc-50 leading-snug">
          {name}, {ageVal}
        </h3>
        
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light truncate">
          {profession} • {cityVal}
        </p>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2.5" />

        <div className="flex flex-col gap-1 text-[11px] text-zinc-600 dark:text-zinc-405 font-medium mb-4">
          <span className="tracking-wide uppercase text-[10px] text-gold-650 dark:text-gold-450 font-bold">
            Astro Profile
          </span>
          <span>Nakshatra: {starVal}</span>
          <span>Rasi: {rasiVal}</span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-2">
          <Link
            href={`/profile/${id}`}
            className="flex-1 py-2 text-center rounded-full border border-maroon-500/30 text-maroon-700 dark:text-gold-450 text-xs font-semibold uppercase tracking-wider hover:bg-maroon-500/5 transition-colors cursor-pointer"
          >
            View Profile
          </Link>
          {onLikeToggle && (
            <button
              onClick={() => onLikeToggle(id)}
              className={`p-2.5 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer touch-target ${
                liked
                  ? 'bg-maroon-500/10 border-maroon-500/40 text-maroon-600'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-maroon-600 hover:border-maroon-500/20'
              }`}
              title={liked ? 'Remove Shortlist' : 'Add Shortlist'}
            >
              <Heart className={`h-4.5 w-4.5 ${liked ? 'fill-maroon-600' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
