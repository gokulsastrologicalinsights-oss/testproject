'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin/dashboard') || pathname?.startsWith('/admin/login')) {
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
                href="https://wa.me/919876543210?text=I'm%20interested%20in%20Gokul%20Vivaham%20services"
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
                <Link href="/register" className="hover:text-maroon-500 dark:hover:text-gold-400 transition-colors">
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
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-maroon-500 dark:text-gold-400 mt-0.5 shrink-0" />
                <span>12, Temple View Avenue, Mylapore, Chennai, Tamil Nadu - 600004</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-maroon-500 dark:text-gold-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-maroon-500 dark:text-gold-400 shrink-0" />
                <span>support@gokulvivaham.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="h-px bg-sandal-200 dark:bg-zinc-800 my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-500 gap-4">
          <div>
            © {new Date().getFullYear()} Gokul Vivaham Matrimony. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms & Conditions</a>
            <a href="#" className="hover:underline">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
