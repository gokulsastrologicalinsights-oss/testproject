'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, Star, ShieldAlert, BarChart3, CreditCard, 
  CheckSquare, Settings, Bell, LogOut, Menu, X, 
  ChevronLeft, ChevronRight, Terminal, ShieldCheck, Database,
  Camera, Calendar, Heart
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const isMockMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || url.includes('placeholder') || !key || key.includes('placeholder');
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbMode, setDbMode] = useState<'Mock Database' | 'Live Supabase'>('Mock Database');

  useEffect(() => {
    setDbMode(isMockMode() ? 'Mock Database' : 'Live Supabase');
  }, []);

  const isLoginPage = pathname === '/admin/login' || pathname?.startsWith('/admin/login');

  const handleAdminSignOut = async () => {
    try {
      await useAuthStore.getState().logout();
      router.push('/admin/login');
    } catch (e: any) {
      alert('Error signing out: ' + e.message);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const menuItems = [
    { name: 'System Queue', href: '/admin/dashboard', icon: CheckSquare, desc: 'Profile & Horoscope Queue' },
    { name: 'Photo Moderation', href: '/admin/gallery-moderation', icon: Camera, desc: 'Review Gallery Uploads' },
    { name: 'Monetization Analytics', href: '/admin/analytics', icon: BarChart3, desc: 'Revenue, MRR & Plans' },
    { name: 'Subscriptions & Billing', href: '/admin/subscriptions', icon: CreditCard, desc: 'Payments & Subscriptions' },
    { name: 'Consultations', href: '/admin/consultations', icon: Calendar, desc: 'Astrologer Bookings' },
    { name: 'Success Stories', href: '/admin/success-stories', icon: Heart, desc: 'Moderate User Stories' },
    { name: 'User Management', href: '/admin/users', icon: Users, desc: 'Profile Registry' },
    { name: 'Reports & Flagged', href: '/admin/reports', icon: ShieldAlert, desc: 'DPDP Complaints' },
    { name: 'Erasure Requests', href: '/admin/deletion-requests', icon: ShieldCheck, desc: 'DPDP Deletion Queue' },
    { name: 'System Settings', href: '/admin/settings', icon: Settings, desc: 'Feature Toggles' },
  ];

  return (
    <div className="flex w-full min-h-screen bg-zinc-950 text-zinc-100 font-sans transition-colors overflow-x-hidden">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside 
        className={`hidden md:flex flex-col border-r border-zinc-900 bg-zinc-950 transition-all duration-300 relative shrink-0 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Collapse Button */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer z-50 hover:bg-zinc-800 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        {/* Sidebar Logo */}
        <div className={`h-20 flex items-center border-b border-zinc-900 ${sidebarCollapsed ? 'justify-center' : 'px-6 gap-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 shrink-0">
            <Star className="h-5 w-5 fill-gold-500/20" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-serif font-bold text-white tracking-wide">Gokul Vivaham</span>
              <span className="text-[9px] text-gold-500 font-mono tracking-widest">CONTROL PANEL</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all group relative cursor-pointer ${
                  isActive 
                    ? 'bg-gold-500/10 text-gold-450 border border-gold-500/20 shadow-[0_0_12px_-3px_rgba(200,169,91,0.15)] font-medium' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
                }`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-105 duration-200 ${isActive ? 'text-gold-500' : 'text-zinc-450'}`} />
                {!sidebarCollapsed && (
                  <div className="flex flex-col text-left">
                    <span className="text-xs">{item.name}</span>
                    <span className="text-[9px] text-zinc-500 font-normal leading-none mt-0.5">{item.desc}</span>
                  </div>
                )}
                
                {/* Active side bar indicator dot */}
                {isActive && (
                  <span className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-gold-500 shadow-[0_0_8px_#c8a95b]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Database indicator */}
        <div className={`p-4 border-t border-zinc-900 bg-zinc-950/60 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center gap-2 text-[10px] font-mono rounded-lg p-2 ${
            isMockMode() ? 'bg-amber-950/30 text-amber-400 border border-amber-900/20' : 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/20'
          }`}>
            <Database className="h-3.5 w-3.5 shrink-0" />
            {!sidebarCollapsed && <span className="font-bold tracking-wider">{dbMode}</span>}
          </div>
        </div>
      </aside>

      {/* MOBILE NAV DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <aside className="w-72 bg-zinc-950 border-r border-zinc-900 flex flex-col h-full animate-in slide-in-from-left duration-300">
            <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500">
                  <Star className="h-4 w-4 fill-gold-500/10" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-serif font-bold text-white">Gokul Vivaham</span>
                  <span className="text-[8px] text-gold-500 font-mono">CONTROL PANEL</span>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 py-6 px-4 flex flex-col gap-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-gold-500/10 text-gold-450 border border-gold-500/20 font-medium' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-gold-500' : 'text-zinc-450'}`} />
                    <div className="flex flex-col text-left">
                      <span className="text-xs">{item.name}</span>
                      <span className="text-[9px] text-zinc-500 leading-none mt-0.5">{item.desc}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-zinc-900 bg-zinc-950/60">
              <div className={`flex items-center gap-2 text-[10px] font-mono rounded-lg p-2.5 justify-center ${
                isMockMode() ? 'bg-amber-950/30 text-amber-400 border border-amber-900/20' : 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/20'
              }`}>
                <Database className="h-3.5 w-3.5 shrink-0" />
                <span className="font-bold tracking-wider">{dbMode}</span>
              </div>
            </div>
          </aside>
          
          {/* overlay click to close */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 md:hidden cursor-pointer"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-zinc-900 rounded-lg border border-zinc-850">
              <Terminal className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-[10px] font-mono text-zinc-450 tracking-wider">SYS STATUS: SECURED</span>
            </div>
            {isMockMode() && (
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold tracking-wider animate-pulse hidden xs:inline">
                SANDBOX / DEMO
              </span>
            )}
          </div>

          <div className="flex items-center gap-5">
            {/* Mock notifications */}
            <button className="p-2.5 rounded-xl hover:bg-zinc-900 text-zinc-400 relative hover:text-zinc-200 transition-colors cursor-pointer border border-transparent hover:border-zinc-800">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-600 ring-2 ring-zinc-950 animate-ping" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-600 ring-2 ring-zinc-950" />
            </button>
            
            <div className="h-6 w-px bg-zinc-900" />

            {/* Admin Profile */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs text-gold-400 shadow-[inset_0_0_8px_rgba(200,169,91,0.05)]">
                AD
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-200">Gokul Admin</span>
                <span className="text-[9px] font-mono text-gold-500 uppercase tracking-widest font-bold">System Operator</span>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleAdminSignOut}
              className="p-2.5 rounded-xl border border-zinc-900 hover:border-red-950 bg-zinc-950 hover:bg-red-950/20 text-zinc-450 hover:text-red-400 transition-all cursor-pointer shadow-sm"
              title="Sign Out Control Panel"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto max-w-full">
          {children}
        </main>

      </div>
    </div>
  );
}
