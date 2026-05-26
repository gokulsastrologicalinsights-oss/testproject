'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, Check, DollarSign, HelpCircle } from 'lucide-react';

export default function Subscription() {
  
  // Current Plan State
  const [currentPlan] = useState({
    name: 'Gold Elite',
    startDate: 'May 20, 2026',
    endDate: 'Aug 20, 2026',
    daysRemaining: 92,
    amount: '₹4,999',
    status: 'Active'
  });

  // Upgrade packages list
  const upgrades = [
    {
      name: 'Diamond Premium',
      price: '₹8,999',
      period: '6 months',
      desc: 'Double your contacts and receive manual matchmaking adjustments.',
      features: [
        'Everything in Gold Elite',
        'View 80 Verified Contacts',
        'Dedicated Matchmaking Manager',
        'Astro compatibility assistance',
        'Direct family meet setup assistance',
        'Priority Customer Support'
      ]
    }
  ];

  // Invoices list
  const [invoices] = useState([
    { id: 'INV-10023', date: 'May 20, 2026', amount: '₹4,999', status: 'Paid', method: 'Razorpay (UPI)' }
  ]);

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
          My Subscription Plan
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
          Review active plan benefits, upgrade settings, and transaction receipts.
        </p>
      </div>

      {/* Current Subscription Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 shadow-xl border border-sandal-200 dark:border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-3 text-left">
          <span className="text-[10px] font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest bg-gold-500/10 px-2.5 py-1 rounded-full max-w-max">
            {currentPlan.status} Plan
          </span>
          <h2 className="text-xl font-serif font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            {currentPlan.name} <Star className="h-5 w-5 text-gold-500 fill-gold-500" />
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mt-2 text-xs font-light text-zinc-650 dark:text-zinc-450 leading-relaxed">
            <div>
              <strong className="font-semibold">Start Date:</strong> {currentPlan.startDate}
            </div>
            <div>
              <strong className="font-semibold">Renewal Date:</strong> {currentPlan.endDate}
            </div>
            <div>
              <strong className="font-semibold">Amount Paid:</strong> {currentPlan.amount}
            </div>
            <div>
              <strong className="font-semibold">Days Remaining:</strong> {currentPlan.daysRemaining} days
            </div>
          </div>
        </div>

        {/* Support call */}
        <div className="p-4 rounded-2xl bg-sandal-50/50 dark:bg-zinc-950/60 border border-sandal-200/40 dark:border-zinc-850 flex flex-col gap-2 max-w-xs">
          <span className="text-xs font-bold text-maroon-600 dark:text-gold-450 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="h-4 w-4" /> Billing Question?
          </span>
          <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-normal font-light">
            Need details about corporate invoices or plan custom pricing? Reach our support team.
          </p>
          <Link href="/contact" className="text-xs font-bold text-maroon-650 dark:text-gold-400 hover:underline">
            Contact Support &rarr;
          </Link>
        </div>
      </div>

      {/* UPGRADE OFFERS */}
      {upgrades.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-serif font-bold text-zinc-900 dark:text-zinc-50">Recommended Upgrades</h2>
          
          {upgrades.map((upgrade) => (
            <div
              key={upgrade.name}
              className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-gold-50/40 via-white to-sandal-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950/30 border border-gold-500/30 shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1 flex flex-col text-left">
                <span className="text-xs font-bold text-gold-650 dark:text-gold-400 uppercase tracking-widest">Recommended Upgrade</span>
                <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white mt-1.5">{upgrade.name}</h3>
                
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-serif font-extrabold text-zinc-900 dark:text-white">{upgrade.price}</span>
                  <span className="text-xs text-zinc-400 pl-1">/ {upgrade.period}</span>
                </div>
                <p className="text-xs text-zinc-550 dark:text-zinc-450 mt-2 font-light max-w-md leading-relaxed">{upgrade.desc}</p>
                
                {/* Upgrade feature list */}
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {upgrade.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-zinc-650 dark:text-zinc-450 font-light">
                      <Check className="h-4 w-4 text-gold-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => alert(`Upgrade checkout initialized for ${upgrade.name}`)}
                className="px-6 py-2.5 rounded-full luxury-gradient text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 shadow transition-all shrink-0 cursor-pointer self-start md:self-center"
              >
                Upgrade Plan
              </button>
            </div>
          ))}
        </div>
      )}

      {/* BILLING HISTORY */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-sandal-200 dark:border-zinc-800/80 flex flex-col gap-4">
        <h2 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">Billing History</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="text-zinc-550 border-b border-zinc-150 dark:border-zinc-800 pb-2">
                <th className="py-2.5 uppercase font-bold tracking-wider">Invoice ID</th>
                <th className="py-2.5 uppercase font-bold tracking-wider">Billing Date</th>
                <th className="py-2.5 uppercase font-bold tracking-wider">Plan Name</th>
                <th className="py-2.5 uppercase font-bold tracking-wider">Amount</th>
                <th className="py-2.5 uppercase font-bold tracking-wider">Method</th>
                <th className="py-2.5 uppercase font-bold tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="text-zinc-600 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-950/20">
                  <td className="py-3">{inv.id}</td>
                  <td className="py-3">{inv.date}</td>
                  <td className="py-3 font-semibold text-zinc-850 dark:text-zinc-100">{currentPlan.name}</td>
                  <td className="py-3 text-zinc-850 dark:text-zinc-100">{inv.amount}</td>
                  <td className="py-3">{inv.method}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-900/10">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
