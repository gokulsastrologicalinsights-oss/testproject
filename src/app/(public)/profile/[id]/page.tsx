'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, Phone, ShieldCheck, Star, Sparkles, 
  ArrowLeft, CheckCircle2, ShieldAlert, Award, 
  MapPin, Users, BookOpen, Clock, Mail, Ban
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProfileView({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // States
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [reported, setReported] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [contactDetails, setContactDetails] = useState({ email: '••••••@••••.com', phone: '+91 ••••• •••••' });

  useEffect(() => {
    const fetchProfileDetails = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // 1. Fetch the target profile by profile_id
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('profile_id', id)
          .maybeSingle();

        if (!profileData) {
          setProfile(null);
          setLoading(false);
          return;
        }

        // 2. Check blocks (two queries to bypass nested or parser checks)
        if (user) {
          const { data: blocked1 } = await supabase
            .from('blocked_users')
            .select('*')
            .eq('blocker_user_id', user.id)
            .eq('blocked_user_id', profileData.user_id)
            .maybeSingle();
          
          const { data: blocked2 } = await supabase
            .from('blocked_users')
            .select('*')
            .eq('blocker_user_id', profileData.user_id)
            .eq('blocked_user_id', user.id)
            .maybeSingle();

          if (blocked1 || blocked2) {
            setIsBlocked(true);
            setLoading(false);
            return;
          }

          // Check connection request status
          const { data: req1 } = await supabase
            .from('match_requests')
            .select('*')
            .eq('sender_user_id', user.id)
            .eq('receiver_user_id', profileData.user_id)
            .maybeSingle();
          
          const { data: req2 } = await supabase
            .from('match_requests')
            .select('*')
            .eq('sender_user_id', profileData.user_id)
            .eq('receiver_user_id', user.id)
            .maybeSingle();

          const request = req1 || req2;
          if (request) {
            setConnectionStatus(request.status);
            if (request.status === 'accepted') {
              setInterestSent(true);
            }
          }
        }

        // 3. Fetch gallery profile picture
        const { data: gallery } = await supabase
          .from('gallery_images')
          .select('image_url')
          .eq('user_id', profileData.user_id)
          .eq('is_profile_picture', true)
          .limit(1)
          .maybeSingle();

        setProfile({
          ...profileData,
          imageUrl: gallery?.image_url || null
        });

        // 4. Check contact visibility
        const canViewContacts = connectionStatus === 'accepted';
        if (canViewContacts && user) {
          const { data: targetUser } = await supabase
            .from('users')
            .select('email, mobile_number')
            .eq('id', profileData.user_id)
            .maybeSingle();
          
          if (targetUser) {
            setContactDetails({
              email: targetUser.email || 'N/A',
              phone: targetUser.mobile_number || 'N/A'
            });
          }
        }

      } catch (err) {
        console.error('Error fetching candidate details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, [id, connectionStatus]);

  const handleConnect = async () => {
    if (!currentUser || !profile) {
      alert('Please log in to send a connection request.');
      router.push('/login');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('match_requests')
        .insert({
          sender_user_id: currentUser.id,
          receiver_user_id: profile.user_id,
          status: 'pending'
        });

      if (error) {
        alert('Failed to send connection request: ' + error.message);
      } else {
        setInterestSent(true);
        setConnectionStatus('pending');
        alert(`Connection interest request sent to ${profile.first_name || 'Candidate'}!`);
      }
    } catch (e: any) {
      alert('Error connecting: ' + e.message);
    }
  };

  const handleBlockUser = async () => {
    if (!currentUser || !profile) return;
    const confirmBlock = confirm(`Are you sure you want to block ${profile.first_name || 'this member'}? You will no longer see each other's profiles.`);
    if (!confirmBlock) return;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_user_id: currentUser.id,
          blocked_user_id: profile.user_id,
          reason: 'Blocked from profile details page.'
        });

      if (error) {
        alert('Failed to block user: ' + error.message);
      } else {
        alert('User blocked successfully.');
        router.push('/dashboard/matches');
      }
    } catch (e: any) {
      alert('Error blocking: ' + e.message);
    }
  };

  const handleReportProfile = async () => {
    if (!currentUser || !profile) return;
    const reason = prompt('Please specify why you are reporting this profile (e.g. fake photo, harassment, wrong information):');
    if (!reason) return;

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_user_id: currentUser.id,
          reported_user_id: profile.user_id,
          reason: reason,
          status: 'pending'
        });

      if (error) {
        alert('Failed to file report: ' + error.message);
      } else {
        setReported(true);
        alert('Profile reported. A moderator will review this report within 24 hours.');
      }
    } catch (e: any) {
      alert('Error reporting: ' + e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-sandal-50/20 dark:bg-zinc-950/20 min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-sm text-zinc-500 font-mono">
          <div className="h-8 w-8 border-4 border-maroon-500 border-t-transparent rounded-full animate-spin" />
          Loading Candidate Profile...
        </div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="max-w-md mx-auto px-6 py-12 text-center bg-white dark:bg-zinc-900 border border-sandal-200 dark:border-zinc-800 rounded-3xl mt-12 flex flex-col items-center gap-5 shadow-lg">
        <Ban className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-serif font-bold text-zinc-850 dark:text-zinc-200">Profile Unavailable</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed font-light">
          This profile is no longer accessible because a block exists between your account and this member.
        </p>
        <Link href="/dashboard/matches" className="px-5 py-2.5 rounded-full luxury-gradient text-white text-xs font-semibold uppercase tracking-wider">
          Return to Matches
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-6 py-12 text-center bg-white dark:bg-zinc-900 border border-sandal-200 dark:border-zinc-800 rounded-3xl mt-12 flex flex-col items-center gap-5 shadow-lg">
        <ShieldAlert className="h-12 w-12 text-gold-600" />
        <h2 className="text-xl font-serif font-bold text-zinc-850 dark:text-zinc-200">Candidate Not Found</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed font-light">
          The requested matrimonial profile could not be found or has been suspended by administrators.
        </p>
        <Link href="/dashboard/matches" className="px-5 py-2.5 rounded-full luxury-gradient text-white text-xs font-semibold uppercase tracking-wider">
          Return to Matches
        </Link>
      </div>
    );
  }

  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || 'M';
  const fullName = `${profile.first_name} ${profile.last_name || ''}`.trim();
  const isPremiumMatch = profile.is_premium;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-left flex flex-col gap-6">
      
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="self-start flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-maroon-600 uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to matches
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-sandal-200 dark:border-zinc-800/80 overflow-hidden flex flex-col md:flex-row items-stretch">
        
        {/* Photo Container with Watermark */}
        <div className="md:w-1/3 bg-gradient-to-tr from-sandal-100 to-rose-50 dark:from-zinc-850 dark:to-zinc-900 p-6 flex flex-col items-center justify-center relative min-h-[250px] overflow-hidden select-none">
          {profile.imageUrl ? (
            <div className="relative group">
              <img 
                src={profile.imageUrl} 
                alt={fullName} 
                className="h-32 w-32 rounded-full object-cover border-2 border-gold-400 shadow-md pointer-events-none select-none"
              />
              {/* Security Image Watermark */}
              <div className="absolute inset-0 rounded-full bg-black/10 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <span className="text-[9px] font-black text-white/50 tracking-widest rotate-45 scale-110 uppercase">
                  GOKUL VIVAHAM
                </span>
              </div>
            </div>
          ) : (
            <div className="h-32 w-32 rounded-full bg-sandal-200/50 dark:bg-zinc-800 border-2 border-gold-400/20 flex items-center justify-center font-serif text-3xl font-bold text-maroon-700 dark:text-gold-450 shadow-inner">
              {initials}
            </div>
          )}
          
          {profile.is_verified && (
            <div className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full bg-emerald-600 text-[9px] font-bold text-white uppercase tracking-widest flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="h-3 w-3" /> Verified Profile
            </div>
          )}

          <div className="absolute bottom-4 right-4 bg-maroon-500/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-gold-400" /> {profile.age} Yrs • Match
          </div>
        </div>

        {/* Headline details */}
        <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
                {fullName}
              </h1>
              <span className="text-xs text-zinc-400 font-mono shrink-0">{profile.profile_id}</span>
            </div>
            
            <span className="text-sm font-semibold text-gold-650 dark:text-gold-400 uppercase tracking-widest">
              {profile.education || 'Education Details Pending'} • {profile.city || 'Location Pending'}
            </span>

            <p className="text-xs text-zinc-550 dark:text-zinc-450 font-light mt-1">
              Astrology Matching: <span className="font-semibold text-gold-600 dark:text-gold-450">Traditional compatibility check active</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-150 dark:border-zinc-850">
            <button
              onClick={() => setIsShortlisted(!isShortlisted)}
              className={`px-4 h-10 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                isShortlisted 
                  ? 'bg-rose-500/10 border-rose-300 text-rose-600' 
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50'
              }`}
            >
              {isShortlisted ? '♥ Shortlisted' : '♡ Shortlist'}
            </button>

            <button
              onClick={handleConnect}
              disabled={interestSent}
              className="px-6 h-10 rounded-full luxury-gradient text-white text-xs font-semibold uppercase tracking-widest hover:opacity-90 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {connectionStatus === 'pending' ? 'Pending Acceptance' : interestSent ? 'Connected ✓' : 'Connect Interest'}
            </button>
          </div>
        </div>

      </div>

      {/* Profile Details Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Overview info */}
        <div className="md:col-span-8 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl shadow-md border border-sandal-200 dark:border-zinc-800/80 flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-maroon-600 dark:text-gold-400 uppercase tracking-widest">About Candidate</span>
            <p className="text-sm font-light text-zinc-650 dark:text-zinc-300 leading-relaxed">
              {profile.about_me || 'No description provided by candidate.'}
            </p>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-850" />

          {/* Details Tables */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold text-maroon-600 dark:text-gold-400 uppercase tracking-widest">Candidate Details</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light text-zinc-655 dark:text-zinc-400">
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Age / DOB:</span>
                <span>{profile.age || 'N/A'} yrs / {profile.date_of_birth || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Height / Weight:</span>
                <span>{profile.height_cm ? `${profile.height_cm} cm` : 'N/A'} / {profile.weight_kg ? `${profile.weight_kg} kg` : 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Religion / Caste:</span>
                <span>{profile.religion || 'Hindu'} • {profile.caste || 'N/A'} {profile.sub_caste ? `(${profile.sub_caste})` : ''}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Native Place:</span>
                <span>{profile.native_place || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Education Details:</span>
                <span>{profile.education || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Employer / Income:</span>
                <span>{profile.company_name || 'N/A'} • {profile.annual_income ? `₹${profile.annual_income.toLocaleString()}` : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-850" />

          {/* Family Details */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold text-maroon-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1">
              <Users className="h-4 w-4 shrink-0" /> Family Background
            </span>
            <ul className="text-xs space-y-2.5 font-light text-zinc-655 dark:text-zinc-400">
              <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Father Details:</strong> {profile.father_name || 'N/A'} {profile.father_occupation ? `(${profile.father_occupation})` : ''}</li>
              <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Mother Details:</strong> {profile.mother_name || 'N/A'} {profile.mother_occupation ? `(${profile.mother_occupation})` : ''}</li>
              <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Siblings Details:</strong> {profile.siblings || 'N/A'}</li>
              <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Family Setup:</strong> {profile.family_type || 'Nuclear'} Family setup</li>
            </ul>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-850" />

          {/* Contact Details (Hiding Phone/Email until connection accepted) */}
          <div className="flex flex-col gap-4 p-5 rounded-2xl bg-sandal-50/30 dark:bg-zinc-950/30 border border-sandal-200/40 dark:border-zinc-800/80">
            <span className="text-xs font-bold text-maroon-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
              <Phone className="h-4 w-4 shrink-0" /> Secure Contact Details
            </span>
            
            {connectionStatus === 'accepted' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light text-zinc-655 dark:text-zinc-400 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2">
                  <Phone className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{contactDetails.phone}</span>
                </div>
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2">
                  <Mail className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{contactDetails.email}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 text-center p-3">
                <p className="text-xs font-light text-zinc-500 dark:text-zinc-450 leading-relaxed">
                  To protect member safety, contact details are private. You must connect and receive their acceptance before phone numbers or emails are visible.
                </p>
                <button 
                  onClick={handleConnect}
                  className="mx-auto px-4 py-2 border border-maroon-500/30 hover:bg-maroon-500/5 text-maroon-700 dark:text-gold-450 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Send Connection Request to View Phone
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Astrology details */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-md border border-sandal-200 dark:border-zinc-800/80 text-left flex flex-col gap-4">
            <span className="text-xs font-bold text-maroon-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1">
              <Award className="h-4 w-4 shrink-0" /> Horoscopic Details
            </span>
            
            <div className="flex flex-col gap-2.5 text-xs font-light text-zinc-650 dark:text-zinc-400">
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Rasi:</span>
                <span>{profile.rasi || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-855 dark:text-zinc-200">Star / Nakshatra:</span>
                <span>{profile.nakshatra || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-855 dark:text-zinc-200">Gothram:</span>
                <span>{profile.gothram || 'N/A'}</span>
              </div>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-850 my-2" />

            <button
              onClick={() => alert(`Horoscope download initiated for Profile ID ${profile.profile_id}`)}
              className="w-full py-2.5 rounded-xl border border-gold-500/30 text-center text-xs font-bold text-gold-650 dark:text-gold-400 hover:bg-gold-500/5 transition-all cursor-pointer"
            >
              Download Horoscope PDF
            </button>
          </div>

          {/* Block & Report Buttons Container */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleBlockUser}
              className="w-full text-xs text-zinc-550 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 font-semibold flex items-center gap-1.5 justify-center py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-red-500/5 transition-colors cursor-pointer"
            >
              <Ban className="h-4 w-4 shrink-0" /> Block this Member
            </button>

            <button
              onClick={handleReportProfile}
              disabled={reported}
              className="w-full text-xs text-red-550 dark:text-red-400 hover:text-red-600 font-semibold flex items-center gap-1.5 justify-center py-2.5 rounded-xl border border-red-500/10 hover:bg-red-500/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <ShieldAlert className="h-4 w-4 shrink-0" /> {reported ? 'Profile Reported' : 'Report Inappropriate Profile'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
