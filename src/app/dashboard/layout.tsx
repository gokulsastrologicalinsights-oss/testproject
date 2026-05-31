'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Heart, Star, UserCheck, ShieldAlert, 
  Settings, Compass, FileText, User, Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SupportSection } from '@/components/contact/SupportSection';
import { useProfileStore } from '@/stores/profileStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile, setProfile } = useProfileStore() as any;
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchSidebarProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Resolve user's database ID from auth_user_id
        const { data: userRow } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        const currentUserId = userRow?.id || user.id;

        const { data } = await supabase
          .from('profiles')
          .select('first_name, last_name, profile_id, is_premium, is_verified, is_suspended, is_banned, warning_notes')
          .eq('user_id', currentUserId)
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

        // Fetch profile photo
        const { data: gallery } = await supabase
          .from('gallery_images')
          .select('image_url')
          .eq('user_id', currentUserId)
          .eq('is_profile_picture', true)
          .limit(1)
          .maybeSingle();

        if (gallery) {
          setProfilePhoto(gallery.image_url);
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
    { name: 'Match Interests', href: '/dashboard/interests', icon: Heart },
    { name: 'Partner Preference', href: '/dashboard/preferences', icon: Settings },
    { name: 'My Profile', href: '/dashboard/profile', icon: User },
    { name: 'Profile Verification', href: '/dashboard/verification', icon: UserCheck },
    { name: 'Astrologer Consultation', href: '/dashboard/consultations', icon: Calendar },
    { name: 'Promote Profile', href: '/dashboard/promote-profile', icon: Star },
  ];

  const initials = profile 
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'M' 
    : '..';
  const fullName = profile 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
    : 'Loading...';
  const profileId = profile ? `ID: ${profile.profile_id}` : '...';
  const memberLevel = profile?.is_premium ? 'Premium Member' : 'Standard Member';

  if (profile?.is_suspended || profile?.is_banned) {
    const handleSignOut = async () => {
      await supabase.auth.signOut();
      window.location.href = '/login';
    };

    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 text-center select-none animate-in fade-in duration-300">
          <div className="p-4 rounded-full bg-red-500/10 text-red-500 shadow-inner">
            <ShieldAlert className="h-10 w-10 animate-bounce" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-serif font-black text-white">
              {profile.is_banned ? 'Account Permanently Banned' : 'Account Suspended'}
            </h1>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Your matrimonial profile on Gokul Vivaham has been {profile.is_banned ? 'permanently banned' : 'temporarily suspended'} by our safety moderation team for violating community guidelines.
            </p>
          </div>

          {(profile.warning_notes || profile.warning_notes === '') && (
            <div className="w-full p-4 rounded-2xl bg-zinc-950 border border-zinc-850 text-left">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Moderator Notes:</span>
              <p className="text-xs text-zinc-300 font-light mt-1 italic font-serif">"{profile.warning_notes || 'Violation of community safety guidelines'}"</p>
            </div>
          )}

          <div className="text-[11px] text-zinc-500 leading-normal font-light">
            If you believe this action was taken in error or want to appeal this safety decision, please contact our support desk at <strong className="font-semibold text-zinc-450">support@gokulvivaham.com</strong>.
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider cursor-pointer border border-zinc-800"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-sandal-50/30 dark:bg-zinc-950/20 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar Menu */}
        <aside className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-md border border-sandal-200 dark:border-zinc-800/80 flex flex-col gap-6">
            
            {/* Quick Profile Summary in Sidebar */}
            <div className="flex flex-col items-center text-center gap-3">
              {profilePhoto ? (
                <img 
                  src={profilePhoto} 
                  alt={fullName} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-gold-400 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sandal-300 to-rose-100 dark:from-zinc-800 dark:to-maroon-950/20 border-2 border-gold-400 flex items-center justify-center font-serif text-2xl font-bold text-maroon-700 dark:text-gold-400 shadow-sm">
                  {initials}
                </div>
              )}
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

          <SupportSection compact />
        </aside>

        {/* Right Content Area */}
        <section className="lg:col-span-9 flex flex-col w-full">
          {children}
        </section>

      </div>
    </div>
  );
}
