'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, Lock, Mail, Key, ShieldCheck, 
  Terminal, ArrowRight, Server, Radio
} from 'lucide-react';

import { supabase } from '@/lib/supabase';

const isMockMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || url.includes('placeholder') || !key || key.includes('placeholder');
};

export default function AdminLogin() {
  const router = useRouter();
  
  // Fields State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  
  // States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);

  // Simulated Console Logs
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'SYSTEM: Admin portal initialized.',
    'SECURE: SSL Handshake verified.',
    'GATEWAY: Ready for credentials.'
  ]);

  const addLog = (msg: string) => {
    setConsoleLogs(prev => [...prev.slice(-3), `SYS: ${msg}`]);
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Admin credentials required.');
      addLog('AUTH_FAIL: Empty fields.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    try {
      if (isMockMode()) {
        // Fallback mock check
        if (email === 'admin@gokul.com' && password === 'admin123') {
          setTwoFactorRequired(true);
          setSuccessMessage('Credentials approved. 2FA Code required.');
          addLog('AUTH_OK: Awaiting 2FA token...');
          alert('Mock 2FA Code: Enter 8888');
        } else {
          setErrorMessage('Invalid admin credentials. (Tip: Use admin@gokul.com / admin123)');
          addLog('AUTH_FAIL: Bad signature match.');
        }
        setLoading(false);
        return;
      }

      // Supabase auth sign-in
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMessage(error.message);
        addLog(`AUTH_FAIL: ${error.message}`);
        setLoading(false);
        return;
      }

      // Query admin_users to see if authorized
      const { data: adminUser, error: adminErr } = await supabase
        .from('admin_users')
        .select('*')
        .eq('auth_user_id', data.user?.id)
        .maybeSingle();

      if (adminErr || !adminUser) {
        await supabase.auth.signOut();
        setErrorMessage('Access denied: You are not authorized as an administrator.');
        addLog('AUTH_FAIL: Not in admin_users list.');
        setLoading(false);
        return;
      }

      setTwoFactorRequired(true);
      setSuccessMessage('Admin credentials verified. Enter 2FA Code.');
      addLog('AUTH_OK: Awaiting 2FA verification.');
      alert('Mock 2FA Code: Enter 8888');
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      addLog('AUTH_FAIL: Server exception.');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode) {
      setErrorMessage('Please enter the 2FA code.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      if (twoFactorCode === '8888') {
        setSuccessMessage('2FA Verified. Access granted.');
        addLog('ACCESS_GRANTED: Initializing session.');
        
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1200);
      } else {
        setErrorMessage('Invalid 2FA code. Enter 8888.');
        addLog('2FA_FAIL: Code mismatch.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-80px)] w-full bg-zinc-950 flex flex-col justify-center items-center p-6 text-zinc-100 transition-colors relative overflow-hidden">
      
      {/* Decorative Server grid animation lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-2xl p-8 z-10 relative">
        
        {/* Security Indicator */}
        <div className="absolute -top-3.5 right-6 bg-red-950 border border-red-800 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
          <Radio className="h-3 w-3 animate-pulse text-red-500" />
          SECURE IP LINK
        </div>

        {/* Admin Branding */}
        <div className="flex flex-col items-center gap-4 mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-850 border border-zinc-800 flex items-center justify-center text-gold-500 shadow-inner">
            <ShieldAlert className="h-8 w-8 text-gold-500" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-mono font-bold tracking-widest uppercase text-white">
              Gokul Vivaham Admin
            </h1>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Control Panel Portal v3.1
            </span>
          </div>
        </div>

        {/* System logs simulator */}
        <div className="mb-6 p-3 bg-black/80 rounded-lg border border-zinc-800 font-mono text-[10px] text-zinc-400 flex flex-col gap-1 select-none">
          <div className="flex items-center justify-between text-zinc-500 border-b border-zinc-900 pb-1.5 mb-1">
            <span className="flex items-center gap-1"><Terminal className="h-3.5 w-3.5" /> SYSTEM LOGS</span>
            <span className="flex items-center gap-1 text-emerald-500"><Server className="h-3 w-3" /> ONLINE</span>
          </div>
          {consoleLogs.map((log, idx) => (
            <div key={idx} className="truncate">{log}</div>
          ))}
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-lg bg-red-950/50 border border-red-900/50 text-xs text-red-400 font-mono font-bold">
            [ERROR] {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-lg bg-emerald-950/50 border border-emerald-900/50 text-xs text-emerald-400 font-mono font-bold flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 shrink-0" /> [STATUS] {successMessage}
          </div>
        )}

        {/* INITIAL CREDENTIALS FORM */}
        {!twoFactorRequired ? (
          <form onSubmit={handleInitialSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gokul.com"
                  className="w-full h-11 pl-11 pr-3.5 rounded-lg border border-zinc-850 bg-zinc-950 text-sm font-mono focus:outline-none focus:border-gold-500/50 text-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[10px] font-mono text-zinc-500 hover:text-gold-400">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-11 pr-3.5 rounded-lg border border-zinc-850 bg-zinc-950 text-sm font-mono focus:outline-none focus:border-gold-500/50 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-gold-500 focus:ring-0 accent-gold-500"
                />
                <span className="text-[11px] font-mono text-zinc-500">Remember Admin Device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-zinc-800 hover:bg-zinc-750 text-white border border-zinc-700 hover:border-gold-500/50 rounded-lg font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* 2FA VERIFICATION FORM */
          <form onSubmit={handleTwoFactorSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                2FA Verification Token
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="Enter 4-digit token"
                  className="w-full h-11 pl-11 pr-3.5 rounded-lg border border-zinc-850 bg-zinc-950 text-sm font-mono focus:outline-none focus:border-gold-500/50 text-white text-center tracking-widest font-black"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-gold-600 hover:bg-gold-500 text-zinc-950 rounded-lg font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer font-bold disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Verify Token &amp; Enter
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setTwoFactorRequired(false);
                setTwoFactorCode('');
                setSuccessMessage('');
                addLog('RESET: Retrying credentials.');
              }}
              className="text-[10px] font-mono text-zinc-500 hover:text-zinc-400 text-center uppercase tracking-wider mt-1"
            >
              Back to credentials
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
