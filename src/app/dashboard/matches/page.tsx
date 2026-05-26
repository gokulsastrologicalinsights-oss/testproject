'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, Heart, HeartOff, Phone, 
  MessageSquare, UserX, CheckCircle2, ShieldAlert, 
  X, Star, HelpCircle, Sparkles, BookOpen 
} from 'lucide-react';
import MatchFilters from '@/components/matchmaking/MatchFilters';
import { matchService } from '@/services/match.service';
import { supabase } from '@/lib/supabase';

function MatchesContent() {
  const searchParams = useSearchParams();

  // Search Param Initializer
  const initialGender = searchParams?.get('gender') === 'Male' ? 'Male' : 'Female';
  const initialReligion = searchParams?.get('religion') || 'Hindu';
  
  // Filter States
  const [gender, setGender] = useState(initialGender);
  const [ageMin, setAgeMin] = useState(21);
  const [ageMax, setAgeMax] = useState(32);
  const [religion, setReligion] = useState(initialReligion);
  const [caste, setCaste] = useState('');
  const [rasi, setRasi] = useState('');
  const [star, setStar] = useState('');
  const [location, setLocation] = useState('');
  const [profession, setProfession] = useState('');

  // Shortlisted state
  const [shortlisted, setShortlisted] = useState<Record<string, boolean>>({});

  // Active selected profile for Modal
  const [activeProfile, setActiveProfile] = useState<any>(null);

  // Sync state if URL search parameters change
  useEffect(() => {
    const gen = searchParams?.get('gender');
    const rel = searchParams?.get('religion');
    if (gen) setGender(gen === 'Male' ? 'Male' : 'Female');
    if (rel) setReligion(rel);
  }, [searchParams]);

  // Live profiles state fetched from database
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          
          // Load existing shortlist favorites
          const { data: favs } = await supabase
            .from('favorites')
            .select('favorite_user_id')
            .eq('user_id', user.id);
          if (favs) {
            const shortlistMap: Record<string, boolean> = {};
            favs.forEach(f => {
              shortlistMap[f.favorite_user_id] = true;
            });
            setShortlisted(shortlistMap);
          }
        }

        const { data } = await matchService.getMatches();
        if (data) {
          setAllProfiles(data);
        }
      } catch (err) {
        console.error('Failed to load profiles:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfiles();
  }, []);


  // Filtering Logic
  const filteredProfiles = allProfiles.filter((profile) => {
    // 1. Gender check: Match opposite gender of the user's dashboard selection, or match directly if clicked in search
    if (profile.gender !== gender) return false;

    // 2. Age check
    if (profile.age < ageMin || profile.age > ageMax) return false;

    // 3. Religion check
    if (religion && profile.religion.toLowerCase() !== religion.toLowerCase()) return false;

    // 4. Caste filter
    if (caste && !profile.caste.toLowerCase().includes(caste.toLowerCase())) return false;

    // 5. Rasi filter
    if (rasi && profile.rasi.toLowerCase() !== rasi.toLowerCase()) return false;

    // 6. Star filter
    if (star && !profile.star.toLowerCase().includes(star.toLowerCase())) return false;

    // 7. Location filter
    if (location && !profile.location.toLowerCase().includes(location.toLowerCase())) return false;

    // 8. Profession filter
    if (profession && !profile.education.toLowerCase().includes(profession.toLowerCase())) return false;

    return true;
  });

  const toggleShortlist = async (id: string, name: string) => {
    if (!currentUserId) return;
    
    // Find profile corresponding to the match ID to get user_id
    const targetProfile = allProfiles.find(p => p.id === id);
    const targetUserId = targetProfile?.user_id || id;
    const isCurrentlyShortlisted = shortlisted[id];

    try {
      if (isCurrentlyShortlisted) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', currentUserId)
          .eq('favorite_user_id', targetUserId);
        
        setShortlisted(prev => ({ ...prev, [id]: false }));
        alert(`Removed ${name} from Shortlist.`);
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: currentUserId,
            favorite_user_id: targetUserId
          });

        setShortlisted(prev => ({ ...prev, [id]: true }));
        alert(`Added ${name} to Shortlist!`);
      }
    } catch (e: any) {
      console.error('Error toggling shortlist:', e);
    }
  };

  const handleBlockUser = async (name: string) => {
    alert(`User ${name} has been reported. Admins will review this within 12 hours.`);
  };

  const handleConnect = async (profile: any) => {
    try {
      const targetUserId = profile.user_id || profile.id;
      const { error } = await matchService.sendRequest(targetUserId);
      if (error) {
        alert('Failed to send connection request: ' + error.message);
      } else {
        alert(`Connection request sent to ${profile.name}!`);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Search Header Banner */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
          Find Your Perfect Match
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
          Use filters to isolate horoscope compatibility, location coordinates, and community preferences.
        </p>
      </div>

      {/* FILTER & MATCHES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: FILTER SIDEBAR */}
        <MatchFilters
          gender={gender}
          setGender={setGender}
          ageMin={ageMin}
          setAgeMin={setAgeMin}
          ageMax={ageMax}
          setAgeMax={setAgeMax}
          religion={religion}
          setReligion={setReligion}
          caste={caste}
          setCaste={setCaste}
          rasi={rasi}
          setRasi={setRasi}
          star={star}
          setStar={setStar}
          location={location}
          setLocation={setLocation}
          profession={profession}
          setProfession={setProfession}
          onClearAll={() => {
            setAgeMin(21);
            setAgeMax(32);
            setReligion('Hindu');
            setCaste('');
            setRasi('');
            setStar('');
            setLocation('');
            setProfession('');
          }}
        />

        {/* RIGHT COLUMN: PROFILES LISTING */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="text-xs text-zinc-500 font-medium">
            Found {filteredProfiles.length} matching profile(s)
          </div>

          {filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-md border border-sandal-200 dark:border-zinc-800/80 hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Photo Section */}
                  <div className="w-full h-40 rounded-2xl bg-gradient-to-tr from-sandal-100 to-amber-50 dark:from-zinc-800 dark:to-zinc-850 flex items-center justify-center relative">
                    <Sparkles className="h-10 w-10 text-maroon-500/10" />
                    
                    {profile.isVerified && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-emerald-600/90 text-[8px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                      </div>
                    )}

                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded bg-white/95 dark:bg-zinc-900/95 text-xs font-semibold text-maroon-700 dark:text-gold-400">
                      {profile.score}% Compatibility
                    </div>
                  </div>

                  {/* Text details */}
                  <div className="mt-4 text-left flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-serif font-bold text-zinc-850 dark:text-zinc-100 truncate">
                        {profile.name}
                      </h3>
                      <span className="text-[10px] text-zinc-400 font-mono shrink-0">{profile.id}</span>
                    </div>

                    <ul className="space-y-1 text-xs text-zinc-650 dark:text-zinc-400 font-light">
                      <li>{profile.age} yrs • {profile.height} • {profile.maritalStatus || 'Never Married'}</li>
                      <li className="font-semibold text-zinc-800 dark:text-zinc-300">{profile.education}</li>
                      <li>{profile.location}</li>
                      <li className="font-semibold text-gold-600 dark:text-gold-400 pt-1.5 uppercase text-[9px] tracking-wider">
                        {profile.rasi} Rasi • {profile.star} • {profile.gothram}
                      </li>
                    </ul>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-3.5 border-t border-zinc-100 dark:border-zinc-850 flex items-center gap-2">
                    
                    {/* Shortlist Icon Button */}
                    <button
                      onClick={() => toggleShortlist(profile.id, profile.name)}
                      className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                        shortlisted[profile.id] 
                          ? 'border-rose-300/40 bg-rose-500/10 text-rose-600' 
                          : 'border-zinc-200 dark:border-zinc-850 text-zinc-400 hover:text-zinc-600'
                      }`}
                      title={shortlisted[profile.id] ? 'Remove Shortlist' : 'Shortlist Profile'}
                    >
                      <Heart className={`h-4.5 w-4.5 ${shortlisted[profile.id] ? 'fill-rose-500' : ''}`} />
                    </button>

                    {/* View Profile */}
                    <button
                      onClick={() => setActiveProfile(profile)}
                      className="flex-1 py-2 text-center rounded-lg border border-zinc-200 dark:border-zinc-850 text-xs font-semibold text-zinc-600 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    {/* Connect Trigger */}
                    <button
                      onClick={() => handleConnect(profile)}
                      className="flex-1 py-2 rounded-lg luxury-gradient text-white text-xs font-semibold hover:opacity-90 shadow transition-all cursor-pointer"
                    >
                      Connect
                    </button>

                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center text-zinc-500 font-mono text-xs border border-dashed border-sandal-200 dark:border-zinc-850 rounded-3xl bg-white dark:bg-zinc-900/60 shadow">
              No matches found. Try clearing your filters or widening your age criteria.
            </div>
          )}

        </div>

      </div>

      {/* DETAIL MODAL OVERLAY */}
      {activeProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-sandal-200 dark:border-zinc-800 overflow-hidden flex flex-col relative max-h-[90vh]">
            
            {/* Header info */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-850 flex justify-between items-start">
              <div className="flex flex-col text-left gap-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-serif font-bold text-zinc-900 dark:text-zinc-50">{activeProfile.name}</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                    {activeProfile.score}% Match
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">ID: {activeProfile.id} • Verified Profile</span>
              </div>

              <button
                onClick={() => setActiveProfile(null)}
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="p-6 overflow-y-auto text-left flex flex-col gap-6 font-light text-zinc-700 dark:text-zinc-350">
              
              {/* Bio description */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-maroon-600 dark:text-gold-400 uppercase tracking-widest">About Me</span>
                <p className="text-sm leading-relaxed">{activeProfile.about}</p>
              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-850" />

              {/* Grid 1: Basic & Astrological */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-maroon-500" /> Basic Details
                  </span>
                  <ul className="text-xs space-y-1.5 font-light">
                    <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Age / Height:</strong> {activeProfile.age} yrs / {activeProfile.height}</li>
                    <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Community:</strong> {activeProfile.religion} • {activeProfile.caste} ({activeProfile.subCaste})</li>
                    <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Native Place:</strong> {activeProfile.native}</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-maroon-500" /> Horoscope Coordinates
                  </span>
                  <ul className="text-xs space-y-1.5 font-light">
                    <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Rasi / Star:</strong> {activeProfile.rasi} Rasi / {activeProfile.star}</li>
                    <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Gothram:</strong> {activeProfile.gothram}</li>
                  </ul>
                </div>

              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-850" />

              {/* Grid 2: Profession & Family */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Education &amp; Work</span>
                  <ul className="text-xs space-y-1.5 font-light">
                    <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Education:</strong> {activeProfile.education}</li>
                    <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Employer / Income:</strong> {activeProfile.company} • {activeProfile.income}</li>
                    <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Work Location:</strong> {activeProfile.location}</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Family Background</span>
                  <ul className="text-xs space-y-1.5 font-light">
                    <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Family Type:</strong> {activeProfile.familyType} Family</li>
                    <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Siblings Details:</strong> {activeProfile.siblings}</li>
                  </ul>
                </div>

              </div>

            </div>

            {/* Footer triggers */}
            <div className="p-6 bg-sandal-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-850 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => { handleBlockUser(activeProfile.name); setActiveProfile(null); }}
                className="text-xs font-semibold text-red-500 hover:text-red-600 inline-flex items-center gap-1 cursor-pointer"
              >
                <ShieldAlert className="h-4 w-4" /> Report Profile
              </button>

              <div className="flex items-center gap-3">
                {/* WhatsApp Inquiry Button */}
                <a
                  href={`https://wa.me/919876543210?text=I'm%20inquiring%20about%20Gokul%20Vivaham%20Profile%20ID%20${activeProfile.id}%20(${activeProfile.name})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-200 inline-flex items-center gap-1.5"
                >
                  <Phone className="h-3.5 w-3.5" /> WhatsApp Inquiry
                </a>

                <button
                  onClick={() => { handleConnect(activeProfile); setActiveProfile(null); }}
                  className="px-5 py-2 rounded-full luxury-gradient text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 shadow-md transition-all cursor-pointer"
                >
                  Send Match Interest
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function Matches() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-12 bg-sandal-50/30 dark:bg-zinc-950/20 min-h-[50vh]">
        <div className="h-8 w-8 border-4 border-maroon-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MatchesContent />
    </Suspense>
  );
}
