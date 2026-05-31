'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { contactConfig } from '@/config/contact.config';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="w-full bg-sandal-100 dark:bg-zinc-950/80 border-t border-sandal-200 dark:border-zinc-800/80 py-12 md:py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="md:col-span-1.5 flex flex-col gap-4">
            <Link href="/" className="flex flex-col select-none group">
              <div className="flex items-center gap-1.5">
                <Heart className="h-5 w-5 text-maroon-500 fill-maroon-500" />
                <span className="text-xl font-serif font-bold text-maroon-700 dark:text-gold-400">
                  Gokul Vivaham
                </span>
              </div>
              <span className="text-xs font-semibold text-gold-600 dark:text-gold-300 pl-6">
                கோகுல் விவாகம்
              </span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed font-light">
              Where Matches Begin with Compatibility. Delivering a trustworthy, premium, and culturally elegant South Indian matrimony experience.
            </p>
            <div className="flex items-center gap-2 mt-2">
              {/* WhatsApp direct contact */}
              <a
                href={contactConfig.whatsapp.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold transition-all shadow-sm hover:scale-105 duration-200"
              >
                <Phone className="h-3.5 w-3.5" />
                WhatsApp Chat Support
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-maroon-600 dark:text-gold-400 uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/" className="hover:text-maroon-500 dark:hover:text-gold-400 transition-colors">
                  Home / Welcome
                </Link>
              </li>
              <li>
                <Link 
                  href="/register" 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('gokul_matrimony_register_draft');
                    }
                  }}
                  className="hover:text-maroon-500 dark:hover:text-gold-400 transition-colors"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-maroon-500 dark:hover:text-gold-400 transition-colors">
                  Member Login
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-maroon-500 dark:hover:text-gold-400 transition-colors">
                  Contact / Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Matches & Profiles */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-maroon-600 dark:text-gold-400 uppercase tracking-widest">
              Explore Matches
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link href="/dashboard/matches" className="hover:text-maroon-500 dark:hover:text-gold-400 transition-colors">
                  All Matrimony Matches
                </Link>
              </li>
              <li>
                <Link href="/dashboard/preferences" className="hover:text-maroon-500 dark:hover:text-gold-400 transition-colors">
                  Partner Preferences
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-maroon-500 dark:hover:text-gold-400 transition-colors">
                  Admin Login Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-maroon-600 dark:text-gold-400 uppercase tracking-widest">
              Gokul Offices
            </h4>
            <ul className="space-y-3 text-sm text-zinc-650 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-maroon-500 dark:text-gold-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{contactConfig.address.display}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-maroon-500 dark:text-gold-400 shrink-0" />
                <a href={contactConfig.phone.link} className="hover:underline hover:text-maroon-600 dark:hover:text-gold-400 font-semibold">
                  {contactConfig.phone.display}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-maroon-500 dark:text-gold-400 shrink-0" />
                <a href={contactConfig.email.link} className="hover:underline hover:text-maroon-600 dark:hover:text-gold-400 font-semibold break-all">
                  {contactConfig.email.support}
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="h-px bg-sandal-200 dark:bg-zinc-800 my-8" />

        <div className="flex flex-col gap-6">
          {/* Global Matrimony & Astrology Disclaimer */}
          <div className="text-[10px] sm:text-xs text-zinc-550 dark:text-zinc-500 font-light leading-relaxed text-center md:text-left bg-sandal-50/50 dark:bg-zinc-900/40 p-4 rounded-xl border border-sandal-200/30 dark:border-zinc-800/50">
            <span className="font-semibold text-zinc-700 dark:text-zinc-350">Regulatory Matchmaking Disclaimer: </span>
            Gokul Vivaham acts only as a matchmaking platform and does not guarantee marriage, compatibility, profile authenticity, or relationship outcomes. Astrology and horoscope matching are provided only as traditional guidance. Members are advised to conduct independent checks before finalizing any alliance.
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-500 gap-4">
            <div>
              © {new Date().getFullYear()} Gokul Vivaham Matrimony. All rights reserved.
            </div>
            
            {/* Legal Pages grid-like footer links */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] font-medium text-zinc-650 dark:text-zinc-450">
              <Link href="/terms" className="hover:underline hover:text-maroon-700 dark:hover:text-gold-400">Terms &amp; Conditions</Link>
              <Link href="/privacy-policy" className="hover:underline hover:text-maroon-700 dark:hover:text-gold-400">Privacy Policy</Link>
              <Link href="/refund-policy" className="hover:underline hover:text-maroon-700 dark:hover:text-gold-400">Refund &amp; Cancellation</Link>
              <Link href="/cookie-policy" className="hover:underline hover:text-maroon-700 dark:hover:text-gold-400">Cookie Policy</Link>
              <Link href="/community-guidelines" className="hover:underline hover:text-maroon-700 dark:hover:text-gold-400">Community Guidelines</Link>
              <Link href="/safety-tips" className="hover:underline hover:text-maroon-700 dark:hover:text-gold-400">Safety Tips</Link>
              <Link href="/verification-policy" className="hover:underline hover:text-maroon-700 dark:hover:text-gold-400">Verification Policy</Link>
              <Link href="/data-deletion" className="hover:underline hover:text-maroon-700 dark:hover:text-gold-400">Data Deletion</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
