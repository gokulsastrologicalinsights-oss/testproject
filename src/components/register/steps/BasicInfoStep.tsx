'use client';

import { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, Mail, Lock } from 'lucide-react';
import TextInput from '../../ui/input/TextInput';

import { authService } from '@/services/auth.service';

interface BasicInfoStepProps {
  formData: any;
  handleChange: (e: any) => void;
  errors: any;
  setErrors: any;
  isOtpVerified: boolean;
  setIsOtpVerified: (v: boolean) => void;
}

export default function BasicInfoStep({
  formData,
  handleChange,
  errors,
  setErrors,
  isOtpVerified,
  setIsOtpVerified
}: BasicInfoStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const sendOtp = async () => {
    if (!formData.mobileNumber) {
      setErrors((prev: any) => ({ ...prev, mobileNumber: 'Enter a valid mobile number first' }));
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const { error } = await authService.signInWithOtp(formData.mobileNumber);
      if (error) {
        setOtpError(error.message || 'Failed to send OTP.');
      } else {
        setIsOtpSent(true);
      }
    } catch (err: any) {
      setOtpError(err.message || 'An error occurred.');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode) {
      setOtpError('Please enter the OTP');
      return;
    }
    setOtpLoading(true);
    setOtpError('');
    try {
      const { error } = await authService.verifyOtp(formData.mobileNumber, otpCode, 'sms');
      if (error) {
        setOtpError(error.message || 'Invalid OTP code. Try entering 1234.');
      } else {
        setIsOtpVerified(true);
        setIsOtpSent(false);
        setOtpError('');
      }
    } catch (err: any) {
      setOtpError(err.message || 'An error occurred.');
    } finally {
      setOtpLoading(false);
    }
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-350">
      
      <div className="md:col-span-2">
        <TextInput
          label="Full Name"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your full name as per ID proof"
          error={errors.fullName}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider text-left">Gender</label>
        <select 
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="h-11 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500 text-zinc-800 dark:text-zinc-150"
        >
          <option value="">Select Gender</option>
          <option value="Female">Bride (Female)</option>
          <option value="Male">Groom (Male)</option>
        </select>
        {errors.gender && <span className="text-[11px] text-red-500 font-semibold text-left">{errors.gender}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider text-left">Date of Birth</label>
        <input 
          type="date" 
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500 text-zinc-800 dark:text-zinc-150"
        />
        {errors.dob && <span className="text-[11px] text-red-500 font-semibold text-left">{errors.dob}</span>}
        {formData.age && (
          <span className="text-xs text-gold-650 font-bold mt-1 text-left">Calculated Age: {formData.age} yrs</span>
        )}
      </div>

      <div className="flex flex-col gap-1 md:col-span-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider text-left">Mobile Number</label>
        <div className="flex gap-2">
          <input 
            type="tel" 
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            disabled={isOtpVerified}
            placeholder="e.g. +91 98765 43210"
            className="flex-1 h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500 text-zinc-800 dark:text-zinc-150 disabled:bg-zinc-50 dark:disabled:bg-zinc-850"
          />
          {!isOtpVerified && (
            <button
              type="button"
              onClick={sendOtp}
              className="h-11 px-4 rounded-lg bg-sandal-100 dark:bg-zinc-800 border border-sandal-300 dark:border-zinc-700 text-maroon-700 dark:text-gold-450 font-semibold text-xs tracking-wider uppercase hover:bg-sandal-200 transition-colors cursor-pointer"
            >
              {isOtpSent ? 'Resend' : 'Send OTP'}
            </button>
          )}
        </div>
        {errors.mobileNumber && <span className="text-[11px] text-red-500 font-semibold text-left">{errors.mobileNumber}</span>}

        {isOtpSent && !isOtpVerified && (
          <div className="mt-2.5 p-3 rounded-lg bg-sandal-50 dark:bg-zinc-950 border border-sandal-200 dark:border-zinc-850 flex flex-col gap-2">
            <span className="text-xs font-semibold text-zinc-650 dark:text-zinc-400 text-left">Verify OTP (Hint: enter 1234)</span>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 4-digit OTP"
                className="h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={verifyOtp}
                disabled={otpLoading}
                className="h-9 px-4 rounded-md luxury-gradient text-white text-xs font-bold uppercase transition-all"
              >
                Verify
              </button>
            </div>
            {otpError && <span className="text-[10px] text-red-500 font-semibold text-left">{otpError}</span>}
          </div>
        )}

        {isOtpVerified && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-500/10 p-2 rounded">
            <CheckCircle2 className="h-4 w-4" /> Phone Number Verified Successfully
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 md:col-span-2">
        <TextInput
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="e.g. name@domain.com"
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
        />
      </div>

      <div className="flex flex-col gap-1 relative text-left">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input 
            type={showPassword ? 'text' : 'password'} 
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Min 6 characters"
            className="w-full h-11 pl-11 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500 text-zinc-800 dark:text-zinc-150"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-650"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <span className="text-[11px] text-red-500 font-semibold">{errors.password}</span>}
      </div>

      <div>
        <TextInput
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter password"
          error={errors.confirmPassword}
        />
      </div>

    </div>
  );
}
