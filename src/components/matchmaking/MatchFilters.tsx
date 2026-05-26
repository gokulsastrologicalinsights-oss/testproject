'use client';

import { Filter } from 'lucide-react';

interface MatchFiltersProps {
  gender: string;
  setGender: (v: string) => void;
  ageMin: number;
  setAgeMin: (v: number) => void;
  ageMax: number;
  setAgeMax: (v: number) => void;
  religion: string;
  setReligion: (v: string) => void;
  caste: string;
  setCaste: (v: string) => void;
  rasi: string;
  setRasi: (v: string) => void;
  star: string;
  setStar: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  profession: string;
  setProfession: (v: string) => void;
  onClearAll: () => void;
}

export default function MatchFilters({
  gender,
  setGender,
  ageMin,
  setAgeMin,
  ageMax,
  setAgeMax,
  religion,
  setReligion,
  caste,
  setCaste,
  rasi,
  setRasi,
  star,
  setStar,
  location,
  setLocation,
  profession,
  setProfession,
  onClearAll
}: MatchFiltersProps) {
  return (
    <aside className="bg-white dark:bg-zinc-900 p-5 rounded-3xl shadow-md border border-sandal-200 dark:border-zinc-800/80 flex flex-col gap-5 sticky top-24 text-left">
      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
        <span className="text-sm font-serif font-bold text-zinc-850 dark:text-zinc-200 flex items-center gap-1.5">
          <Filter className="h-4.5 w-4.5 text-maroon-600 dark:text-gold-450" />
          Refine Search
        </span>
        <button
          type="button"
          onClick={onClearAll}
          className="text-[10px] font-bold text-maroon-600 dark:text-gold-405 hover:underline uppercase tracking-wider cursor-pointer"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-col gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-450">
        
        {/* Gender Toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="uppercase tracking-wider">Looking for</label>
          <div className="grid grid-cols-2 gap-2 bg-sandal-50 dark:bg-zinc-950 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setGender('Female')}
              className={`py-1.5 rounded font-bold uppercase transition-all cursor-pointer ${
                gender === 'Female' 
                  ? 'bg-white dark:bg-zinc-855 text-maroon-600 dark:text-gold-450 shadow-sm' 
                  : 'text-zinc-400'
              }`}
            >
              Bride
            </button>
            <button
              type="button"
              onClick={() => setGender('Male')}
              className={`py-1.5 rounded font-bold uppercase transition-all cursor-pointer ${
                gender === 'Male' 
                  ? 'bg-white dark:bg-zinc-855 text-maroon-600 dark:text-gold-450 shadow-sm' 
                  : 'text-zinc-400'
              }`}
            >
              Groom
            </button>
          </div>
        </div>

        {/* Age Range */}
        <div className="flex flex-col gap-1.5">
          <label className="uppercase tracking-wider">Age Bracket: {ageMin} to {ageMax}</label>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min={18} 
              max={60} 
              value={ageMin}
              onChange={(e) => setAgeMin(Math.min(parseInt(e.target.value), ageMax))}
              className="w-full accent-maroon-600"
            />
            <input 
              type="range" 
              min={18} 
              max={60} 
              value={ageMax}
              onChange={(e) => setAgeMax(Math.max(parseInt(e.target.value), ageMin))}
              className="w-full accent-maroon-600"
            />
          </div>
        </div>

        {/* Religion */}
        <div className="flex flex-col gap-1.5">
          <label className="uppercase tracking-wider">Religion</label>
          <select
            value={religion}
            onChange={(e) => setReligion(e.target.value)}
            className="w-full h-10 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs focus:outline-none text-zinc-800 dark:text-zinc-150"
          >
            <option value="">All Religions</option>
            <option value="Hindu">Hindu</option>
            <option value="Christian">Christian</option>
            <option value="Muslim">Muslim</option>
          </select>
        </div>

        {/* Caste */}
        <div className="flex flex-col gap-1.5">
          <label className="uppercase tracking-wider">Caste / Sub-caste</label>
          <input
            type="text"
            placeholder="e.g. Iyer, Pillai"
            value={caste}
            onChange={(e) => setCaste(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs focus:outline-none text-zinc-800 dark:text-zinc-150"
          />
        </div>

        {/* Rasi */}
        <div className="flex flex-col gap-1.5">
          <label className="uppercase tracking-wider">Rasi</label>
          <select
            value={rasi}
            onChange={(e) => setRasi(e.target.value)}
            className="w-full h-10 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs focus:outline-none text-zinc-800 dark:text-zinc-150"
          >
            <option value="">All Rasis</option>
            <option value="Mesham">Mesham (Aries)</option>
            <option value="Rishabham">Rishabham (Taurus)</option>
            <option value="Mithunam">Mithunam (Gemini)</option>
            <option value="Kadagam">Kadagam (Cancer)</option>
            <option value="Simham">Simham (Leo)</option>
            <option value="Kanni">Kanni (Virgo)</option>
            <option value="Thulaam">Thulaam (Libra)</option>
            <option value="Viruchigam">Viruchigam (Scorpio)</option>
            <option value="Dhanusu">Dhanusu (Sagittarius)</option>
            <option value="Magaram">Magaram (Capricorn)</option>
            <option value="Kumbham">Kumbham (Aquarius)</option>
            <option value="Meenam">Meenam (Pisces)</option>
          </select>
        </div>

        {/* Nakshatra / Star */}
        <div className="flex flex-col gap-1.5">
          <label className="uppercase tracking-wider">Star / Nakshatra</label>
          <input
            type="text"
            placeholder="e.g. Pooram, Aswini"
            value={star}
            onChange={(e) => setStar(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs focus:outline-none text-zinc-800 dark:text-zinc-150"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1.5">
          <label className="uppercase tracking-wider">Work Location</label>
          <input
            type="text"
            placeholder="e.g. Bangalore, Chennai"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs focus:outline-none text-zinc-800 dark:text-zinc-150"
          />
        </div>

        {/* Profession */}
        <div className="flex flex-col gap-1.5">
          <label className="uppercase tracking-wider">Profession Keyword</label>
          <input
            type="text"
            placeholder="e.g. Engineer, Doctor, Manager"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs focus:outline-none text-zinc-800 dark:text-zinc-150"
          />
        </div>

      </div>
    </aside>
  );
}
