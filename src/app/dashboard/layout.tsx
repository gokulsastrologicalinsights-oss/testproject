'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Heart, Star, UserCheck, ShieldAlert, 
  Settings, Compass, FileText, User
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSidebarProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('profiles')
          .select('first_name, last_name, profile_id, is_premium, is_verified')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          setProfile(data);
        } else {
          // Fallback if profile row not created yet
          const nameParts = user.user_metadata?.full_name?.split(' ') || ['Member'];
          setProfile({
            first_name: nameParts[0],
            last_name: nameParts.slice(1).join(' ') || '',
            profile_id: 'GVV-PENDING',
            is_premium: false,
            is_verified: false
          });
        }
      } catch (err) {
        console.error('Error fetching sidebar profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarProfile();
  }, []);

  const links = [
    { name: 'Overview', href: '/dashboard', icon: Home },
    { name: 'Search Matches', href: '/dashboard/matches', icon: Compass },
    { name: 'Partner Preference', href: '/dashboard/preferences', icon: Settings },
    { name: 'My Profile', href: '/dashboard/profile', icon: User },
  ];

  const initials = profile 
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'M' 
    : '..';
  const fullName = profile 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
    : 'Loading...';
  const profileId = profile ? `ID: ${profile.profile_id}` : '...';
  const memberLevel = profile?.is_premium ? 'Premium Member' : 'Standard Member';

  return (
    <div className="flex-1 w-full bg-sandal-50/30 dark:bg-zinc-950/20 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar Menu */}
        <aside className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-md border border-sandal-200 dark:border-zinc-800/80 flex flex-col gap-6">
            
            {/* Quick Profile Summary in Sidebar */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sandal-300 to-rose-100 dark:from-zinc-800 dark:to-maroon-950/20 border-2 border-gold-400 flex items-center justify-center font-serif text-2xl font-bold text-maroon-700 dark:text-gold-400 shadow-sm">
                {initials}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-base font-serif font-bold text-zinc-900 dark:text-zinc-50 flex items-center justify-center gap-1">
                  {fullName}
                  {profile?.is_verified && (
                    <span className="w-3.5 h-3.5 bg-emerald-600 rounded-full flex items-center justify-center text-[8px] font-bold text-white uppercase tracking-normal" title="Verified Member">✓</span>
                  )}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{profileId}</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-gold-400/20 text-[10px] font-bold text-gold-700 dark:text-gold-400 uppercase tracking-widest leading-none">
                {memberLevel}
              </div>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800/85" />

            {/* Sidebar Navigation */}
            <nav className="flex flex-col gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-maroon-500/10 text-maroon-700 dark:text-gold-400' 
                        : 'text-zinc-650 dark:text-zinc-400 hover:bg-sandal-50 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-maroon-600 dark:text-gold-400' : 'text-zinc-400'}`} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

          </div>

          {/* Quick Help Callout */}
          <div className="p-5 rounded-3xl bg-maroon-500/5 dark:bg-maroon-950/10 border border-maroon-500/10 text-left flex flex-col gap-2.5">
            <span className="text-xs font-bold text-maroon-600 dark:text-gold-400 uppercase tracking-wider">Astro matching issues?</span>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-light leading-relaxed">
              If your horoscope matching requires manual correction, contact our helpdesk.
            </p>
            <Link 
              href="/contact" 
              className="text-xs font-bold text-maroon-700 dark:text-gold-400 hover:underline inline-flex items-center gap-1"
            >
              Get Support <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </aside>

        {/* Right Content Area */}
        <section className="lg:col-span-9 flex flex-col w-full">
          {children}
        </section>

      </div>
    </div>
  );
}

// Inline ArrowUpRight icon since it's locally used
function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
