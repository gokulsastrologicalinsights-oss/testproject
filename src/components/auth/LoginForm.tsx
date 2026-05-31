'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Heart } from 'lucide-react';
import TextInput from '../ui/input/TextInput';
import PrimaryButton from '../ui/button/PrimaryButton';
import Toast from '@/components/ui/toast/Toast';
import { authService } from '@/services/auth.service';

export default function LoginForm() {
  const router = useRouter();

  // Fields State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await authService.signInWithPassword(email, password);

      if (error) {
        setErrorMessage(error.message + ' (Tip: Use demo@gokul.com / 123456)');
      } else {
        setSuccessMessage('Login successful!');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const { data, error } = await authService.signInWithOAuth('google');
      if (error) {
        setErrorMessage(error.message || 'Google authentication failed.');
        setLoading(false);
      } else {
        setSuccessMessage('Successfully authenticated with Google!');
        if (data?.url) {
          window.location.href = data.url;
        } else {
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-sandal-200 dark:border-zinc-800/80 text-left">

      {/* Mobile-only Branding Header */}
      <div className="lg:hidden flex flex-col items-center text-center gap-1.5 mb-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-1.5">
          <Heart className="h-5 w-5 text-maroon-550 fill-maroon-550" />
          <span className="text-xl font-serif font-bold text-maroon-700 dark:text-gold-400">
            Gokul Vivaham
          </span>
        </div>
        <span className="text-[10px] font-semibold text-gold-600 dark:text-gold-300 uppercase tracking-widest leading-none">
          கோகுல் விவாகம்
        </span>
        <div className="w-12 h-0.5 bg-sandal-300 dark:bg-zinc-800 mt-1" />
      </div>

      <div className="flex flex-col items-center text-center gap-2 mb-6">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
          Welcome Back
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
          Enter your credentials to access your matrimony dashboard
        </p>
      </div>

      {/* Feedback Messages */}
      {errorMessage && (
        <div className="mb-4">
          <Toast message={errorMessage} type="error" onClose={() => setErrorMessage('')} />
        </div>
      )}
      {successMessage && (
        <div className="mb-4">
          <Toast message={successMessage} type="success" onClose={() => setSuccessMessage('')} />
        </div>
      )}

      {/* EMAIL / PASSWORD LOGIN FORM */}
      <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
        <TextInput
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="demo@gokul.com"
          icon={<Mail className="h-4 w-4" />}
        />

        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Password</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-maroon-600 dark:text-gold-400 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (e.g. 123456)"
              className="w-full h-11 pl-11 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500 text-zinc-800 dark:text-zinc-150"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-zinc-400"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4.5 w-4.5 text-maroon-600 rounded border-zinc-300 accent-maroon-600"
            />
            <span className="text-xs text-zinc-500">Remember Me</span>
          </label>
        </div>

        <PrimaryButton type="submit" loading={loading} icon={<ArrowRight className="h-4 w-4" />}>
          Sign In
        </PrimaryButton>
      </form>

      {/* SOCIAL LOGIN SEPARATOR */}
      <div className="my-6 flex items-center justify-between">
        <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full" />
        <span className="text-[10px] text-zinc-400 uppercase tracking-widest px-3 shrink-0">or continue with</span>
        <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full" />
      </div>

      {/* GOOGLE SIGN IN BUTTON */}
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full h-11 border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.57 5.57 0 0 1 8.4 12.943a5.57 5.57 0 0 1 5.59-5.571c1.517 0 2.9.61 3.924 1.6 l3.057-3.057A9.873 9.873 0 0 0 13.99 3c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.85 0 9.74-4.11 9.74-9.9 0-.6-.05-1.19-.15-1.815H12.24Z"
          />
        </svg>
        Google
      </button>

      <div className="mt-8 text-center text-sm text-zinc-655 dark:text-zinc-455 font-light">
        New to Gokul Vivaham?{' '}
        <Link 
          href="/register" 
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('gokul_matrimony_register_draft');
            }
          }}
          className="text-maroon-600 dark:text-gold-400 font-bold hover:underline"
        >
          Create New Account
        </Link>
      </div>

    </div>
  );
}
