'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, Phone, ShieldCheck, Star, Sparkles, 
  ArrowLeft, CheckCircle2, ShieldAlert, Award, 
  MapPin, Users, BookOpen, Clock 
} from 'lucide-react';

export default function ProfileView({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // States
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  // Mock Database Lookup based on ID
  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      const mockProfiles = [
        {
          id: 'GVV-089',
          name: 'Gokulakrishnan M.',
          gender: 'Male',
          age: 28,
          height: '178 cm',
          weight: '72 kg',
          religion: 'Hindu',
          caste: 'Iyer',
          subCaste: 'Vadama',
          rasi: 'Dhanusu',
          star: 'Pooradam',
          gothram: 'Bharadwaj',
          location: 'Bangalore',
          native: 'Thanjavur',
          education: 'MBA Project Manager',
          company: 'TCS',
          income: '₹14,00,000',
          about: 'A simple, modern individual who values family traditions. Enjoys travel, South Indian music, and reading. Looking for an understanding partner who matches our family values.',
          fatherName: 'Murugan K.',
          fatherOccupation: 'Retired Bank Manager',
          motherName: 'Savithri M.',
          motherOccupation: 'Homemaker',
          familyType: 'Nuclear',
          siblings: '1 sister (married)',
          partnerExpectations: 'Looking for a vegetarian bride (preferably Iyer) who resides in Chennai/Bangalore. Education should be BE/MBA/MS. Matching star alignment is desired.',
          score: 95,
          isVerified: true
        },
        {
          id: 'GVV-088',
          name: 'Soundarya S.',
          gender: 'Female',
          age: 26,
          height: '163 cm',
          weight: '54 kg',
          religion: 'Hindu',
          caste: 'Iyer',
          subCaste: 'Vadama',
          rasi: 'Simham',
          star: 'Pooram',
          gothram: 'Kasyapa',
          location: 'Chennai',
          native: 'Mylapore',
          education: 'B.Tech Software Engineer',
          company: 'Amazon',
          income: '₹16,00,000',
          about: 'Traditional at heart with a progressive outlook. Passionate about Classical dance and software design. Family values are very important to me.',
          fatherName: 'Sundarraman K.',
          fatherOccupation: 'Chartered Accountant',
          motherName: 'Janaki S.',
          motherOccupation: 'Teacher',
          familyType: 'Nuclear',
          siblings: '1 younger brother',
          partnerExpectations: 'Looking for a well-educated groom (B.Tech/MS/MBA) working in software field, based in Chennai or abroad. Astrological compatibility is essential.',
          score: 92,
          isVerified: true
        }
      ];

      // Fallback search profile
      const found = mockProfiles.find(p => p.id === id) || mockProfiles[0];
      setProfile(found);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [id]);

  const handleConnect = () => {
    setInterestSent(true);
    alert(`Interest invitation sent to ${profile.name}!`);
  };

  const handleReport = () => {
    alert(`Report filed for profile ${profile.id}. Admins will audit this listing.`);
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
        
        {/* Photo Container */}
        <div className="md:w-1/3 bg-gradient-to-tr from-sandal-100 to-rose-50 dark:from-zinc-800 dark:to-zinc-850 p-6 flex flex-col items-center justify-center relative min-h-[250px]">
          <Heart className="h-16 w-16 text-maroon-500/20" />
          
          {profile.isVerified && (
            <div className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full bg-emerald-600 text-[9px] font-bold text-white uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Verified Profile
            </div>
          )}

          <div className="absolute bottom-4 right-4 bg-maroon-500/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-gold-400" /> {profile.score}% Match
          </div>
        </div>

        {/* Headline details */}
        <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
                {profile.name}
              </h1>
              <span className="text-xs text-zinc-400 font-mono shrink-0">{profile.id}</span>
            </div>
            
            <span className="text-sm font-semibold text-gold-600 dark:text-gold-400 uppercase tracking-widest">
              {profile.education} • {profile.location}
            </span>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mt-2 leading-relaxed">
              Last active: {new Date().toLocaleDateString()} • Profile created: September 2025
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

            {/* WhatsApp Inquiry */}
            <a
              href={`https://wa.me/919876543210?text=I'm%20inquiring%20about%20Gokul%20Vivaham%20Profile%20ID%20${profile.id}%20(${profile.name})`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-all"
            >
              <Phone className="h-4 w-4" /> WhatsApp Inquiry
            </a>

            <button
              onClick={handleConnect}
              disabled={interestSent}
              className="px-6 h-10 rounded-full luxury-gradient text-white text-xs font-semibold uppercase tracking-widest hover:opacity-90 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {interestSent ? 'Interest Sent ✓' : 'Connect Interest'}
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
            <p className="text-sm font-light text-zinc-650 dark:text-zinc-300 leading-relaxed">{profile.about}</p>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-850" />

          {/* Details Tables */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold text-maroon-600 dark:text-gold-400 uppercase tracking-widest">Candidate Details</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light text-zinc-655 dark:text-zinc-400">
              
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Age / DOB:</span>
                <span>{profile.age} yrs / {profile.dob}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Height / Weight:</span>
                <span>{profile.height} / {profile.weight}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Religion:</span>
                <span>{profile.religion}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Caste / Sub-Caste:</span>
                <span>{profile.caste} ({profile.subCaste})</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Native Place:</span>
                <span>{profile.native}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Education Details:</span>
                <span>{profile.education}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Employer / Income:</span>
                <span>{profile.company} • {profile.income}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Work Location:</span>
                <span>{profile.location}</span>
              </div>

            </div>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-850" />

          {/* Family Details */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold text-maroon-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1"><Users className="h-4 w-4 shrink-0" /> Family Background</span>
            <ul className="text-xs space-y-2.5 font-light text-zinc-650 dark:text-zinc-400">
              <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Father Details:</strong> {profile.fatherName} • {profile.fatherOccupation}</li>
              <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Mother Details:</strong> {profile.motherName} • {profile.motherOccupation}</li>
              <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Siblings details:</strong> {profile.siblings}</li>
              <li><strong className="font-semibold text-zinc-850 dark:text-zinc-200">Family Setup:</strong> {profile.familyType} Family setup</li>
            </ul>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-850" />

          {/* Expectations */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-maroon-600 dark:text-gold-400 uppercase tracking-widest">Ideal Partner Expectations</span>
            <p className="text-sm font-light text-zinc-655 dark:text-zinc-300 leading-relaxed">{profile.partnerExpectations}</p>
          </div>

        </div>

        {/* Right Side: Astrology details */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-md border border-sandal-200 dark:border-zinc-800/80 text-left flex flex-col gap-4">
            <span className="text-xs font-bold text-maroon-600 dark:text-gold-400 uppercase tracking-widest flex items-center gap-1"><Award className="h-4 w-4 shrink-0" /> Horoscopic Details</span>
            
            <div className="flex flex-col gap-2.5 text-xs font-light text-zinc-650 dark:text-zinc-400">
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Rasi:</span>
                <span>{profile.rasi}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Star / Nakshatra:</span>
                <span>{profile.star}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-850 pb-2">
                <span className="font-semibold text-zinc-850 dark:text-zinc-200">Gothram:</span>
                <span>{profile.gothram}</span>
              </div>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-850 my-2" />

            <button
              onClick={() => alert(`Horoscope download initiated for Profile ID ${profile.id}`)}
              className="w-full py-2.5 rounded-xl border border-gold-500/30 text-center text-xs font-bold text-gold-650 dark:text-gold-400 hover:bg-gold-500/5 transition-all cursor-pointer"
            >
              Download Horoscope PDF
            </button>
          </div>

          {/* Report Button */}
          <button
            onClick={handleReport}
            className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 justify-center py-2.5 rounded-xl border border-red-500/10 hover:bg-red-500/5 cursor-pointer"
          >
            <ShieldAlert className="h-4 w-4" /> Report Inappropriate Profile
          </button>
        </div>

      </div>

    </div>
  );
}
