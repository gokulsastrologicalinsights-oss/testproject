'use client';

import { useState } from 'react';
import { 
  User, CheckCircle2, Save, FileText, Image as ImageIcon, 
  MapPin, Award, BookOpen, Users 
} from 'lucide-react';

export default function Profile() {
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'basic' | 'astro' | 'career' | 'family' | 'photo'>('basic');

  // Fields State (Mocking Revathi's profile)
  const [formData, setFormData] = useState({
    fullName: 'Revathi Murugesan',
    email: 'revathi.m@gmail.com',
    mobileNumber: '+91 94432 10892',
    dob: '2000-04-12',
    age: '26',
    maritalStatus: 'Never Married',
    motherTongue: 'Tamil',
    religion: 'Hindu',
    caste: 'Iyer',
    subCaste: 'Vadama',
    star: 'Pooram',
    rasi: 'Simham',
    gothram: 'Kasyapa',
    height: '163',
    weight: '55',
    physicalStatus: 'Normal',
    education: 'B.Tech Computer Science',
    occupation: 'Software Engineer',
    companyName: 'Amazon',
    annualIncome: '₹16,00,000',
    workLocation: 'Chennai',
    fatherName: 'Murugesan K.',
    fatherOccupation: 'Retired Banker',
    motherName: 'Lalitha Murugesan',
    motherOccupation: 'Homemaker',
    siblings: '1 Younger Brother (College Student)',
    nativePlace: 'Mylapore, Chennai',
    familyType: 'Nuclear',
    aboutMe: 'Traditional at heart with a progressive outlook. Passionate about Classical music, digital designs, and South Indian vegetarian cooking. Seeking an understanding partner who values family relationships and career development.',
    partnerExpectations: 'Looking for a clean-shaven, vegetarian groom (preferably Iyer/Iyengar) who resides in Chennai/Bangalore. Education should be B.Tech/MS/MBA. Matching rasi/star alignment is desired.'
  });

  // Photo state
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Status states
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');

    setTimeout(() => {
      setSaving(false);
      setSuccess('Profile updated successfully!');
      window.scrollTo(0, 0);
      setTimeout(() => setSuccess(''), 3000);
    }, 1200);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        alert('Photo uploaded successfully! Awaiting Admin review.');
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
          My Matrimony Profile
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
          Manage your personal bios, education credentials, astrological coordinates, and gallery uploads.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {success}
        </div>
      )}

      {/* Main card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-sandal-200 dark:border-zinc-800/80 overflow-hidden">
        
        {/* Profile Tabs */}
        <div className="flex flex-wrap bg-sandal-50 dark:bg-zinc-950 p-2 border-b border-zinc-100 dark:border-zinc-850 gap-1">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'basic' 
                ? 'bg-white dark:bg-zinc-850 text-maroon-700 dark:text-gold-400 shadow-sm font-bold' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <User className="h-4 w-4" /> Basic Details
          </button>
          <button
            onClick={() => setActiveTab('astro')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'astro' 
                ? 'bg-white dark:bg-zinc-850 text-maroon-700 dark:text-gold-400 shadow-sm font-bold' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Award className="h-4 w-4" /> Astro &amp; Physical
          </button>
          <button
            onClick={() => setActiveTab('career')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'career' 
                ? 'bg-white dark:bg-zinc-850 text-maroon-700 dark:text-gold-400 shadow-sm font-bold' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <BookOpen className="h-4 w-4" /> Career
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'family' 
                ? 'bg-white dark:bg-zinc-850 text-maroon-700 dark:text-gold-400 shadow-sm font-bold' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Users className="h-4 w-4" /> Family
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'photo' 
                ? 'bg-white dark:bg-zinc-850 text-maroon-700 dark:text-gold-400 shadow-sm font-bold' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <ImageIcon className="h-4 w-4" /> Photos
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 md:p-8 flex flex-col gap-6">
          
          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  disabled
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-850 text-sm focus:outline-none text-zinc-550"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mobile Number</label>
                <input 
                  type="text" 
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  disabled
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-850 text-sm focus:outline-none text-zinc-550"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">About Me</label>
                <textarea 
                  name="aboutMe"
                  rows={4}
                  value={formData.aboutMe}
                  onChange={handleChange}
                  className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ASTRO & PHYSICAL */}
          {activeTab === 'astro' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Star / Nakshatra</label>
                <input 
                  type="text" 
                  name="star"
                  value={formData.star}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Rasi</label>
                <input 
                  type="text" 
                  name="rasi"
                  value={formData.rasi}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Gothram</label>
                <input 
                  type="text" 
                  name="gothram"
                  value={formData.gothram}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Height (cm)</label>
                <input 
                  type="number" 
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Weight (kg)</label>
                <input 
                  type="number" 
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Physical Status</label>
                <select
                  name="physicalStatus"
                  value={formData.physicalStatus}
                  onChange={handleChange}
                  className="h-11 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                >
                  <option value="Normal">Normal</option>
                  <option value="Physically Challenged">Physically Challenged</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: CAREER & WORK */}
          {activeTab === 'career' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Education Level</label>
                <input 
                  type="text" 
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Occupation</label>
                <input 
                  type="text" 
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Company Name</label>
                <input 
                  type="text" 
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Annual Income</label>
                <input 
                  type="text" 
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Work Location</label>
                <input 
                  type="text" 
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: FAMILY */}
          {activeTab === 'family' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Father Name</label>
                <input 
                  type="text" 
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Father Occupation</label>
                <input 
                  type="text" 
                  name="fatherOccupation"
                  value={formData.fatherOccupation}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mother Name</label>
                <input 
                  type="text" 
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mother Occupation</label>
                <input 
                  type="text" 
                  name="motherOccupation"
                  value={formData.motherOccupation}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Native Place</label>
                <input 
                  type="text" 
                  name="nativePlace"
                  value={formData.nativePlace}
                  onChange={handleChange}
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Family Type</label>
                <select
                  name="familyType"
                  value={formData.familyType}
                  onChange={handleChange}
                  className="h-11 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                >
                  <option value="Nuclear">Nuclear</option>
                  <option value="Joint">Joint</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 5: PHOTO UPLOAD */}
          {activeTab === 'photo' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="flex flex-col items-center gap-4 text-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="Upload Preview" 
                    className="h-28 w-28 rounded-full object-cover border border-gold-400 shadow-md"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-full bg-sandal-100 dark:bg-zinc-800 border-2 border-gold-400/20 flex items-center justify-center font-serif text-3xl font-bold text-maroon-700 dark:text-gold-450 shadow-inner">
                    RM
                  </div>
                )}
                
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Upload primary profile photo</span>
                  <span className="text-xs text-zinc-450 dark:text-zinc-500">Requires Admin review to be visible to other members.</span>
                </div>
              </div>

              {/* Mock upload list */}
              <div className="grid grid-cols-3 gap-4">
                <div className="h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
                  Photo Slot 2
                </div>
                <div className="h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
                  Photo Slot 3
                </div>
                <div className="h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 text-xs">
                  Photo Slot 4
                </div>
              </div>
            </div>
          )}

          {/* Save trigger */}
          {activeTab !== 'photo' && (
            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-850">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-8 py-2.5 rounded-full luxury-gradient text-white font-semibold text-xs uppercase tracking-widest hover:opacity-90 shadow-md transition-all cursor-pointer"
              >
                {saving ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Save Profile Changes
                    <Save className="h-4 w-4 text-white" />
                  </>
                )}
              </button>
            </div>
          )}

        </form>
      </div>

    </div>
  );
}
