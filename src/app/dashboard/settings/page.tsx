'use client';

import { useState } from 'react';
import { Settings, Lock, Eye, EyeOff, Save, Trash, HelpCircle, ShieldCheck } from 'lucide-react';

export default function AccountSettings() {
  
  // Privacy States
  const [profileVisible, setProfileVisible] = useState(true);
  const [showPhotoToAll, setShowPhotoToAll] = useState(true);
  const [allowAstroMatch, setAllowAstroMatch] = useState(true);

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Blocked list state
  const [blockedUsers, setBlockedUsers] = useState([
    { id: 'GVV-055', name: 'Unknown User 1', reason: 'Repeated match spamming' },
    { id: 'GVV-091', name: 'Unknown User 2', reason: 'Unverified background checks' }
  ]);

  const handlePrivacySave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Account privacy settings updated successfully!');
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    alert('Account credentials password changed successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleUnblock = (id: string, name: string) => {
    setBlockedUsers(prev => prev.filter(user => user.id !== id));
    alert(`Unblocked member ${name}`);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
          Account Settings
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
          Manage profile privacy rules, account credentials, and blocked member lists.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: PRIVACY RULES & CREDENTIALS */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* PRIVACY TOGGLES FORM */}
          <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl shadow-xl border border-sandal-200 dark:border-zinc-800/80">
            <form onSubmit={handlePrivacySave} className="flex flex-col gap-5">
              <h2 className="text-lg font-serif font-bold text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-850 pb-3 flex items-center gap-1.5">
                <Settings className="h-5 w-5 text-maroon-600 dark:text-gold-400" />
                Privacy &amp; Visibility Settings
              </h2>

              <div className="flex flex-col gap-4 text-xs font-semibold text-zinc-500">
                <label className="flex items-center justify-between p-3 rounded-xl bg-sandal-50/30 dark:bg-zinc-950/20 border border-sandal-100 dark:border-zinc-850 cursor-pointer select-none">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-sm font-semibold text-zinc-850 dark:text-zinc-200">Profile Visibility Status</span>
                    <span className="text-xs font-light text-zinc-500 leading-normal">
                      When disabled, your profile will be hidden from search matches.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileVisible}
                    onChange={(e) => setProfileVisible(e.target.checked)}
                    className="h-5 w-5 text-maroon-600 rounded border-zinc-300 accent-maroon-600 shrink-0"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-sandal-50/30 dark:bg-zinc-950/20 border border-sandal-100 dark:border-zinc-850 cursor-pointer select-none">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-sm font-semibold text-zinc-850 dark:text-zinc-200">Show Primary Photo to All</span>
                    <span className="text-xs font-light text-zinc-500 leading-normal">
                      Hide your photos from unverified members.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showPhotoToAll}
                    onChange={(e) => setShowPhotoToAll(e.target.checked)}
                    className="h-5 w-5 text-maroon-600 rounded border-zinc-300 accent-maroon-600 shrink-0"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-sandal-50/30 dark:bg-zinc-950/20 border border-sandal-100 dark:border-zinc-850 cursor-pointer select-none">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-sm font-semibold text-zinc-850 dark:text-zinc-200">Allow Horoscope Matching</span>
                    <span className="text-xs font-light text-zinc-500 leading-normal">
                      Allow other members to check star matching coordinates against your profile.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowAstroMatch}
                    onChange={(e) => setAllowAstroMatch(e.target.checked)}
                    className="h-5 w-5 text-maroon-600 rounded border-zinc-300 accent-maroon-600 shrink-0"
                  />
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg luxury-gradient text-white text-xs font-bold uppercase tracking-wider shadow hover:opacity-90 flex items-center gap-1 cursor-pointer"
                >
                  <Save className="h-4 w-4" /> Save Settings
                </button>
              </div>
            </form>
          </div>

          {/* PASSWORD CHANGE FORM */}
          <div className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl shadow-xl border border-sandal-200 dark:border-zinc-800/80">
            <form onSubmit={handlePasswordSave} className="flex flex-col gap-5">
              <h2 className="text-lg font-serif font-bold text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-850 pb-3 flex items-center gap-1.5">
                <Lock className="h-5 w-5 text-maroon-600 dark:text-gold-400" />
                Change Password
              </h2>

              <div className="grid grid-cols-1 gap-4 text-xs font-semibold text-zinc-500">
                <div className="flex flex-col gap-1 text-left">
                  <label className="uppercase tracking-wider">Old Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <label className="uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type password"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg luxury-gradient text-white text-xs font-bold uppercase tracking-wider shadow hover:opacity-90 flex items-center gap-1 cursor-pointer"
                >
                  <Save className="h-4 w-4" /> Reset Password
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: BLOCKED MEMBERS */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl border border-sandal-200 dark:border-zinc-800/80 flex flex-col gap-5">
          <h2 className="text-lg font-serif font-bold text-zinc-850 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-850 pb-3">
            Blocked Members
          </h2>

          {blockedUsers.length > 0 ? (
            <div className="flex flex-col gap-4">
              {blockedUsers.map((user) => (
                <div 
                  key={user.id}
                  className="p-3.5 rounded-xl bg-sandal-50/30 dark:bg-zinc-950/40 border border-sandal-100 dark:border-zinc-850 flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{user.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono mt-0.5">{user.id}</span>
                    <span className="text-[9px] text-zinc-550 dark:text-zinc-450 mt-1 leading-normal italic line-clamp-1" title={user.reason}>
                      Reason: {user.reason}
                    </span>
                  </div>

                  <button
                    onClick={() => handleUnblock(user.id, user.name)}
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-200/50 hover:bg-red-500/5 transition-colors cursor-pointer shrink-0"
                    title="Unblock User"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/20">
              No blocked users.
            </div>
          )}

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-850 text-xs text-zinc-500 leading-normal font-light">
            Blocked members cannot send match interest invitations or view your contact coordinates.
          </div>
        </div>

      </div>

    </div>
  );
}
