'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Compass, Check, X, Phone } from 'lucide-react';

export default function Interests() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  // Received Interests
  const [receivedInterests, setReceivedInterests] = useState([
    {
      id: 'GVV-120',
      name: 'Pranesh Kumar M.',
      age: 29,
      location: 'Coimbatore',
      education: 'Doctor (MD)',
      star: 'Uthiradam',
      score: 85,
      date: 'Received: Yesterday',
      status: 'pending'
    },
    {
      id: 'GVV-054',
      name: 'Srinivasan R.',
      age: 28,
      location: 'Chennai',
      education: 'B.Tech Tech Lead',
      star: 'Pooram',
      score: 91,
      date: 'Received: May 20, 2026',
      status: 'accepted'
    }
  ]);

  // Sent Interests
  const [sentInterests, setSentInterests] = useState([
    {
      id: 'GVV-089',
      name: 'Gokulakrishnan M.',
      age: 28,
      location: 'Bangalore',
      education: 'MBA Project Manager',
      star: 'Pooradam',
      score: 95,
      date: 'Sent: May 23, 2026',
      status: 'pending'
    },
    {
      id: 'GVV-045',
      name: 'Venkatesh Prasad S.',
      age: 30,
      location: 'Chennai',
      education: 'MS Cloud Architect',
      star: 'Aswini',
      score: 88,
      date: 'Sent: May 22, 2026',
      status: 'declined'
    }
  ]);

  const handleAccept = (id: string, name: string) => {
    setReceivedInterests(prev => 
      prev.map(i => i.id === id ? { ...i, status: 'accepted' } : i)
    );
    alert(`Accepted match interest from ${name}! Phone contact is now unlocked.`);
  };

  const handleDecline = (id: string, name: string) => {
    setReceivedInterests(prev => 
      prev.map(i => i.id === id ? { ...i, status: 'declined' } : i)
    );
    alert(`Declined match interest from ${name}.`);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
          Match Interests
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
          Track interest invitations you have sent to or received from other members.
        </p>
      </div>

      {/* Tab controls */}
      <div className="flex bg-sandal-100 dark:bg-zinc-800 p-1 rounded-xl max-w-sm">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === 'received'
              ? 'bg-white dark:bg-zinc-700 text-maroon-700 dark:text-gold-400 shadow'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          Received ({receivedInterests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 py-2.5 text-xs font-semibold rounded-lg tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === 'sent'
              ? 'bg-white dark:bg-zinc-700 text-maroon-700 dark:text-gold-400 shadow'
              : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          Sent ({sentInterests.length})
        </button>
      </div>

      {/* Interests list */}
      <div className="flex flex-col gap-4">
        {activeTab === 'received' ? (
          receivedInterests.length > 0 ? (
            receivedInterests.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white dark:bg-zinc-900 rounded-3xl shadow-md border border-sandal-200 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-serif font-bold text-zinc-900 dark:text-zinc-50">{item.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-maroon-500/10 text-maroon-750 dark:text-gold-400 font-bold">
                      {item.score}% Match
                    </span>
                  </div>
                  <span className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 font-light leading-normal">
                    {item.age} yrs • {item.education} • {item.location} • Star: {item.star} • <span className="text-zinc-400 font-mono text-[10px]">{item.date}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  {item.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleDecline(item.id, item.name)}
                        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-500 cursor-pointer"
                        title="Decline"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAccept(item.id, item.name)}
                        className="flex items-center gap-1 px-4 h-8.5 rounded-lg luxury-gradient text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        <Check className="h-4 w-4" /> Accept
                      </button>
                    </>
                  ) : item.status === 'accepted' ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                        Accepted ✓
                      </span>
                      <a
                        href={`https://wa.me/919876543210?text=Hello%20${item.name},%20we%2520matched%20on%20Gokul%20Vivaham.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center"
                        title="WhatsApp Chat"
                      >
                        <Phone className="h-4.5 w-4.5" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                      Declined
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900">
              No interests received yet.
            </div>
          )
        ) : (
          sentInterests.length > 0 ? (
            sentInterests.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-white dark:bg-zinc-900 rounded-3xl shadow-md border border-sandal-200 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-serif font-bold text-zinc-900 dark:text-zinc-50">{item.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-maroon-500/10 text-maroon-750 dark:text-gold-400 font-bold">
                      {item.score}% Match
                    </span>
                  </div>
                  <span className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 font-light leading-normal">
                    {item.age} yrs • {item.education} • {item.location} • Star: {item.star} • <span className="text-zinc-400 font-mono text-[10px]">{item.date}</span>
                  </span>
                </div>

                <div className="flex items-center">
                  {item.status === 'pending' ? (
                    <span className="text-xs font-semibold text-gold-650 bg-gold-500/10 border border-gold-500/20 px-3 py-1.5 rounded-full uppercase tracking-wider">
                      Awaiting Response
                    </span>
                  ) : item.status === 'accepted' ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                        Accepted ✓
                      </span>
                      <a
                        href={`https://wa.me/919876543210?text=Hello%20${item.name},%20we%2520matched%20on%20Gokul%20Vivaham.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center"
                      >
                        <Phone className="h-4.5 w-4.5" />
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                      Declined
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900">
              No interests sent yet. Explore matches and initiate connections!
            </div>
          )
        )}
      </div>

      {/* Explore suggestions link */}
      <Link
        href="/dashboard/matches"
        className="self-center mt-4 px-6 py-2.5 rounded-full border border-maroon-500/20 text-maroon-700 dark:text-gold-400 text-xs font-bold uppercase tracking-wider hover:bg-maroon-500/5 transition-all shadow-sm"
      >
        Explore Matches list
      </Link>

    </div>
  );
}
