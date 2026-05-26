'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, UserCheck, Star, ShieldAlert, FileSpreadsheet, 
  DollarSign, Check, X, Search, Bell, LogOut, ShieldCheck 
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  
  // Dashboard stats state
  const [stats, setStats] = useState({
    totalUsers: 1420,
    newRegistrations: 28,
    premiumMembers: 312,
    pendingApprovals: 8,
    horoscopesPending: 12,
    activeMatches: 654,
    revenueThisMonth: 148500
  });

  // Registrations Queue
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  // Horoscope Queue
  const [pendingHoroscopes, setPendingHoroscopes] = useState<any[]>([]);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Transactions State
  const [transactions, setTransactions] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [statsRes, profilesRes, horoscopesRes, txnsRes] = await Promise.all([
          adminService.getAdminStats(),
          adminService.getPendingProfiles(),
          adminService.getPendingHoroscopes(),
          adminService.getTransactions()
        ]);

        if (statsRes.data) setStats(statsRes.data);
        if (profilesRes.data) setPendingUsers(profilesRes.data);
        if (horoscopesRes.data) setPendingHoroscopes(horoscopesRes.data);
        if (txnsRes.data) setTransactions(txnsRes.data);
      } catch (err) {
        console.error('Error loading admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Actions
  const handleApproveUser = async (user: any) => {
    const identifier = user.user_id || user.id;
    try {
      const { error } = await adminService.approveProfile(identifier);
      if (error) {
        alert('Failed to approve profile: ' + error.message);
        return;
      }
      setPendingUsers(prev => prev.filter(u => u.id !== user.id));
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers + 1,
        pendingApprovals: Math.max(0, prev.pendingApprovals - 1)
      }));
      alert(`Approved Profile: ${user.name}`);
    } catch (e: any) {
      alert('Error approving user: ' + e.message);
    }
  };

  const handleRejectUser = (id: any, name: string) => {
    setPendingUsers(prev => prev.filter(u => u.id !== id));
    setStats(prev => ({
      ...prev,
      pendingApprovals: Math.max(0, prev.pendingApprovals - 1)
    }));
    alert(`Rejected Profile: ${name}`);
  };

  const handleVerifyHoroscope = async (id: any, name: string) => {
    try {
      const { success, error } = await adminService.verifyHoroscope(id);
      if (error || !success) {
        alert('Failed to verify horoscope: ' + (error?.message || 'unknown error'));
        return;
      }
      setPendingHoroscopes(prev => prev.filter(h => h.id !== id));
      setStats(prev => ({
        ...prev,
        horoscopesPending: Math.max(0, prev.horoscopesPending - 1)
      }));
      alert(`Horoscope Verified for: ${name}`);
    } catch (e: any) {
      alert('Error verifying horoscope: ' + e.message);
    }
  };

  const handleAdminSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (e: any) {
      alert('Error signing out: ' + e.message);
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans transition-colors">
      
      {/* ADMIN HEADER */}
      <header className="h-20 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-serif font-bold text-white">Gokul Vivaham Control Panel</span>
            <span className="text-[10px] text-zinc-500 font-mono">SYS STATUS: SECURED</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Mock notifications */}
          <button className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-600" />
          </button>
          
          {/* Admin profile */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm text-gold-400">
              AD
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-zinc-200">Gokul Admin</span>
              <span className="text-[10px] text-gold-500">System Operator</span>
            </div>
          </div>

          <button
            onClick={handleAdminSignOut}
            className="p-2 rounded-full border border-zinc-800 hover:bg-zinc-800 text-zinc-400 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1 */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-mono font-bold text-white">{stats.totalUsers}</span>
              <span className="text-xs text-zinc-500 font-medium mt-1">Total Members</span>
            </div>
            <div className="w-11 h-11 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-mono font-bold text-emerald-400">+{stats.newRegistrations}</span>
              <span className="text-xs text-zinc-500 font-medium mt-1">New Sign-ups (24h)</span>
            </div>
            <div className="w-11 h-11 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-mono font-bold text-gold-500">{stats.premiumMembers}</span>
              <span className="text-xs text-zinc-500 font-medium mt-1">Premium Accounts</span>
            </div>
            <div className="w-11 h-11 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500">
              <Star className="h-5 w-5" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-mono font-bold text-rose-500">₹{stats.revenueThisMonth.toLocaleString()}</span>
              <span className="text-xs text-zinc-500 font-medium mt-1">Revenue (This Month)</span>
            </div>
            <div className="w-11 h-11 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* WORKLOAD QUEUES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PENDING APPROVALS QUEUE */}
          <div className="lg:col-span-8 flex flex-col bg-zinc-900 border border-zinc-850 rounded-2xl shadow-lg p-5 md:p-6 gap-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div className="flex flex-col">
                <h2 className="text-lg font-serif font-bold text-white">Pending Registrations ({pendingUsers.length})</h2>
                <span className="text-xs text-zinc-500">Inspect and approve newly registered matrimony profiles</span>
              </div>
              
              <div className="relative max-w-xs w-full hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search profiles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-8 pl-9 pr-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs focus:outline-none focus:border-zinc-700 text-white font-mono"
                />
              </div>
            </div>

            {pendingUsers.length > 0 ? (
              <div className="flex flex-col gap-4">
                {pendingUsers
                  .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((user) => (
                    <div 
                      key={user.id} 
                      className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-800 transition-colors"
                    >
                      <div className="flex flex-col text-left gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{user.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                            {user.gender}
                          </span>
                        </div>
                        <span className="text-xs text-zinc-400 leading-normal">
                          {user.age} yrs • {user.caste} • {user.location} • <span className="text-zinc-500">{user.date}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center">
                        <button
                          onClick={() => handleRejectUser(user.id, user.name)}
                          className="p-2 rounded-lg border border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Reject Account"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleApproveUser(user)}
                          className="flex items-center gap-1 px-3 h-8.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-white"
                          title="Approve Account"
                        >
                          <Check className="h-4 w-4" /> Approve
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-850 rounded-xl">
                No profiles pending approval. Good job!
              </div>
            )}
          </div>

          {/* HOROSCOPE VERIFICATIONS QUEUE */}
          <div className="lg:col-span-4 flex flex-col bg-zinc-900 border border-zinc-850 rounded-2xl shadow-lg p-5 md:p-6 gap-6">
            <div className="flex flex-col border-b border-zinc-800 pb-4">
              <h2 className="text-lg font-serif font-bold text-white">Horoscope Queue</h2>
              <span className="text-xs text-zinc-500">Verify uploaded PDFs &amp; images</span>
            </div>

            {pendingHoroscopes.length > 0 ? (
              <div className="flex flex-col gap-4">
                {pendingHoroscopes.map((horo) => (
                  <div 
                    key={horo.id}
                    className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 flex flex-col gap-3.5 hover:border-zinc-800 transition-colors text-left"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-200">{horo.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{horo.rasi} • {horo.star} • {horo.date}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-900">
                      <a 
                        href={horo.url}
                        className="text-[10px] font-mono text-gold-500 hover:underline uppercase tracking-wider"
                      >
                        [View Upload]
                      </a>
                      <button
                        onClick={() => handleVerifyHoroscope(horo.id, horo.name)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-gold-400 uppercase tracking-widest transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" /> Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-850 rounded-xl my-auto">
                No uploads pending verification.
              </div>
            )}
          </div>

        </div>

        {/* TRANSACTIONS & ANALYTICS SUMMARY */}
        <div className="bg-zinc-900 border border-zinc-850 rounded-2xl shadow-lg p-5 md:p-6 flex flex-col gap-4">
          <div className="flex flex-col text-left">
            <h2 className="text-lg font-serif font-bold text-white">Recent Transactions</h2>
            <span className="text-xs text-zinc-500">Revenue analytics and subscription completions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono text-left">
              <thead>
                <tr className="text-zinc-500 border-b border-zinc-800 pb-2">
                  <th className="py-3 font-semibold uppercase text-xs tracking-wider">Transaction ID</th>
                  <th className="py-3 font-semibold uppercase text-xs tracking-wider">User</th>
                  <th className="py-3 font-semibold uppercase text-xs tracking-wider">Plan</th>
                  <th className="py-3 font-semibold uppercase text-xs tracking-wider">Date</th>
                  <th className="py-3 font-semibold uppercase text-xs tracking-wider">Amount</th>
                  <th className="py-3 font-semibold uppercase text-xs tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {transactions.map((txn, idx) => (
                  <tr key={idx} className="text-zinc-300 hover:bg-zinc-950/40">
                    <td className="py-3">{txn.id}</td>
                    <td className="py-3 font-semibold text-white">{txn.user}</td>
                    <td className="py-3 text-gold-400">{txn.plan}</td>
                    <td className="py-3">{txn.date}</td>
                    <td className="py-3 text-white">{txn.amount}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-900/30">
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

    </div>
  );
}
