'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Heart, User, LogOut, ShieldAlert, Phone } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Listen for auth state changes
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // Do not show main navbar inside the admin dashboard or admin login
  if (pathname?.startsWith('/admin/dashboard') || pathname?.startsWith('/admin/login')) {
    return null;
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Matches', href: '/dashboard/matches' },
    { name: 'Preferences', href: '/dashboard/preferences' },
    { name: 'Support', href: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo & Branding */}
          <div className="flex items-center">
            <Link href="/" className="flex flex-col justify-center select-none group">
              <div className="flex items-center gap-1.5">
                <Heart className="h-6 w-6 text-maroon-500 fill-maroon-500 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xl md:text-2xl font-serif font-bold text-maroon-700 dark:text-gold-400 leading-none">
                  Gokul Vivaham
                </span>
              </div>
              <span className="text-xs font-medium text-gold-600 dark:text-gold-300 pl-7 tracking-wider">
                கோகுல் விவாகம்
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 hover:text-maroon-600 dark:hover:text-gold-400 ${
                  pathname === link.href
                    ? 'text-maroon-600 dark:text-gold-400 border-b-2 border-maroon-500 dark:border-gold-500 pb-1'
                    : 'text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

            <ThemeToggle />

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-maroon-600 dark:hover:text-gold-400 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-4 h-10 rounded-full border border-maroon-500/20 text-maroon-600 dark:text-maroon-400 hover:bg-maroon-50 dark:hover:bg-maroon-950/20 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-maroon-700 dark:text-gold-400 hover:text-maroon-800 dark:hover:text-gold-300 px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center px-5 h-10 rounded-full luxury-gradient text-white text-xs font-semibold uppercase tracking-widest hover:opacity-90 shadow-md transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile/Tablet menu button */}
          <div className="lg:hidden flex items-center gap-3">
            <ThemeToggle />
            {user && (
              <Link
                href="/dashboard/profile"
                className="p-2 rounded-full border border-maroon-500/20 text-maroon-600 dark:text-gold-450 hover:bg-maroon-50 dark:hover:bg-zinc-800 flex items-center justify-center shrink-0 touch-target"
                title="View Profile"
              >
                <User className="h-4.5 w-4.5" />
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-sandal-100 dark:hover:bg-zinc-800 focus:outline-none touch-target"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu */}
      {isOpen && (
        <div className="lg:hidden glass-panel border-t shadow-lg animate-in fade-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-maroon-500/10 text-maroon-700 dark:text-gold-400 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-sandal-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-zinc-600 dark:text-zinc-300 hover:bg-sandal-50 dark:hover:bg-zinc-800/50"
                >
                  <User className="h-5 w-5" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-maroon-600 dark:text-maroon-400 hover:bg-maroon-500/5 text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 p-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-2 border border-maroon-500/20 text-maroon-700 dark:text-gold-400 font-semibold rounded-full hover:bg-sandal-100 dark:hover:bg-zinc-800"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-2 luxury-gradient text-white font-semibold rounded-full hover:opacity-90 shadow-md"
                >
                  Register
                </Link>
              </div>
            )}

            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

            {/* Admin entry point in mobile menu */}
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-maroon-600 dark:hover:text-gold-400"
            >
              <ShieldAlert className="h-4 w-4" />
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
