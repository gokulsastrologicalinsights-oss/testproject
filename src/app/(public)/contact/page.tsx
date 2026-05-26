'use client';

import { useState } from 'react';
import { 
  Mail, Phone, MapPin, CheckCircle2, MessageCircle, 
  HelpCircle, Compass, ShieldCheck 
} from 'lucide-react';

export default function Contact() {
  
  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');

  // Status States
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert('Please fill in Name, Email, and Message.');
      return;
    }

    setSubmitting(true);
    setSuccess('');

    setTimeout(() => {
      setSubmitting(false);
      setSuccess('Your message has been received! Our support desk will reach out to you within 24 hours.');
      setName('');
      setEmail('');
      setMobile('');
      setMessage('');
      window.scrollTo(0, 0);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-left flex flex-col gap-12 flex-grow">
      
      {/* Header Info */}
      <div className="flex flex-col gap-3 text-center items-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
          Support &amp; Contact Desk
        </h1>
        <div className="w-16 h-1 luxury-gradient rounded-full" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-light max-w-lg mt-1">
          Have questions about verification badges, membership packages, or horoscope calculations? Contact our support staff.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: OFFICE CONTACT DETAILS */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-sandal-200 dark:border-zinc-800/80 shadow-md flex flex-col gap-6">
            <h2 className="text-lg font-serif font-bold text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-850 pb-3">
              Office Details
            </h2>

            <div className="flex flex-col gap-5">
              
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-maroon-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Main Branch Office</span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-350 leading-relaxed font-light">
                    12, Temple View Avenue, Mylapore, Chennai, Tamil Nadu - 600004
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Phone className="h-5 w-5 text-maroon-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Help Desk Hotlines</span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-350 font-light">
                    +91 98765 43210 (Support Desk)<br />
                    +91 98765 43211 (Astrology Office)
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-maroon-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Official Email Contacts</span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-350 font-light hover:underline">
                    support@gokulvivaham.com<br />
                    verifications@gokulvivaham.com
                  </span>
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 text-xs text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
              Office hours are Monday to Saturday, 9:00 AM to 6:00 PM IST. Urgent inquiries can be submitted via the WhatsApp button.
            </div>
          </div>

          {/* Quick WhatsApp chat prompt */}
          <a
            href="https://wa.me/919876543210?text=I'm%20having%20an%20issue%20with%20Gokul%20Vivaham%20services"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-between transition-all duration-200 hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 fill-white text-emerald-600" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-sm font-semibold">Live WhatsApp Support</span>
                <span className="text-xs opacity-80 mt-0.5">Direct chat with relationship managers</span>
              </div>
            </div>
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">Chat Now</span>
          </a>

        </div>

        {/* RIGHT COLUMN: CONTACT FORM */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl shadow-xl border border-sandal-200 dark:border-zinc-800/80">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <h2 className="text-lg font-serif font-bold text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-850 pb-3">
              Inquiry Form
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@domain.com"
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mobile Number (Optional)</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Subject Of Inquiry</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-11 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500"
                >
                  <option value="General Inquiry">General Inquiry / Welcome Info</option>
                  <option value="Profile Verification">Profile Verification Badges</option>
                  <option value="Horoscope Match Help">Horoscope Matching Queries</option>
                  <option value="Premium Plans Support">Premium Package Billing</option>
                  <option value="Report Bug">Technical Problem</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Message Details</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or question in detail..."
                  className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500 resize-none"
                />
              </div>
            </div>

            {/* Submit Trigger */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 h-11 rounded-full luxury-gradient text-white text-xs font-semibold uppercase tracking-widest hover:opacity-90 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Send Inquiry Message'
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
