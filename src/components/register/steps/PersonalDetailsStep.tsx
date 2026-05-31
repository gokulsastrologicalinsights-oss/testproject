'use client';

import TextInput from '../../ui/input/TextInput';

interface PersonalDetailsStepProps {
  formData: any;
  handleChange: (e: any) => void;
  errors: any;
}

export default function PersonalDetailsStep({
  formData,
  handleChange,
  errors
}: PersonalDetailsStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-350">
      
      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Marital Status</label>
        <select
          name="maritalStatus"
          value={formData.maritalStatus}
          onChange={handleChange}
          className="h-11 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500 text-white"
        >
          <option value="">Select Status</option>
          <option value="Never Married">Never Married</option>
          <option value="Widowed">Widowed</option>
          <option value="Divorced">Divorced</option>
          <option value="Awaiting Divorce">Awaiting Divorce</option>
        </select>
        {errors.maritalStatus && <span className="text-[11px] text-red-500 font-semibold">{errors.maritalStatus}</span>}
      </div>

      <div>
        <TextInput
          label="Mother Tongue"
          type="text"
          name="motherTongue"
          value={formData.motherTongue}
          onChange={handleChange}
          placeholder="e.g. Tamil"
          error={errors.motherTongue}
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Religion</label>
        <select
          name="religion"
          value={formData.religion}
          onChange={handleChange}
          className="h-11 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500 text-white"
        >
          <option value="Hindu">Hindu</option>
          <option value="Christian">Christian</option>
          <option value="Muslim">Muslim</option>
          <option value="Other">Other</option>
        </select>
        {errors.religion && <span className="text-[11px] text-red-500 font-semibold">{errors.religion}</span>}
      </div>

      <div>
        <TextInput
          label="Caste / Community"
          type="text"
          name="caste"
          value={formData.caste}
          onChange={handleChange}
          placeholder="e.g. Iyer, Naidu, Pillai"
        />
      </div>

      <div>
        <TextInput
          label="Sub Caste"
          type="text"
          name="subCaste"
          value={formData.subCaste}
          onChange={handleChange}
          placeholder="e.g. Vadama, Vadagalai"
        />
      </div>

      <div>
        <TextInput
          label="Star / Nakshatra"
          type="text"
          name="star"
          value={formData.star}
          onChange={handleChange}
          placeholder="e.g. Pooram, Aswini"
          error={errors.star}
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Rasi</label>
        <select
          name="rasi"
          value={formData.rasi}
          onChange={handleChange}
          className="h-11 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500 text-white"
        >
          <option value="">Select Rasi</option>
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
        {errors.rasi && <span className="text-[11px] text-red-500 font-semibold">{errors.rasi}</span>}
      </div>

      <div>
        <TextInput
          label="Gothram"
          type="text"
          name="gothram"
          value={formData.gothram}
          onChange={handleChange}
          placeholder="e.g. Bharadwaj, Kasyapa"
        />
      </div>

      <div>
        <TextInput
          label="Height (cm)"
          type="number"
          name="height"
          value={formData.height}
          onChange={handleChange}
          placeholder="e.g. 172"
          error={errors.height}
        />
      </div>

      <div>
        <TextInput
          label="Weight (kg)"
          type="number"
          name="weight"
          value={formData.weight}
          onChange={handleChange}
          placeholder="e.g. 68"
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Physical Status</label>
        <select
          name="physicalStatus"
          value={formData.physicalStatus}
          onChange={handleChange}
          className="h-11 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500 text-white"
        >
          <option value="Normal">Normal</option>
          <option value="Physically Challenged">Physically Challenged</option>
        </select>
      </div>

    </div>
  );
}
