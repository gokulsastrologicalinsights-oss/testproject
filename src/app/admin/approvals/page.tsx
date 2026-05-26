'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Check, X, Ban, Flag, ShieldAlert, Trash2, 
  User, Image, FileText, LogOut, Bell, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminApprovalsPage() {
  const router = useRouter();

  // Navigation states
  const [activeTab, setActiveTab] = useState<'profiles' | 'reports' | 'photos' | 'deletion'>('profiles');
  const [loading, setLoading] = useState(true);

  // Data states
  const [profilesQueue, setProfilesQueue] = useState<any[]>([]);
  const [reportsQueue, setReportsQueue] = useState<any[]>([]);
  const [photosQueue, setPhotosQueue] = useState<any[]>([]);
  const [deletionQueue, setDeletionQueue] = useState<any[]>([]);

  // System audit logs list
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fetchModerationData = async () => {
    setLoading(true);
    try {
      // 1. Fetch pending profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_suspended', false);
      
      // Filter for profiles that need verification/approval
      setProfilesQueue((profiles || []).filter((p: any) => !p.is_verified));

      // 2. Fetch abuse reports
      const { data: reports } = await supabase
        .from('reports')
        .select('*');
      
      const enrichedReports = [];
      if (reports) {
        for (const report of reports) {
          const { data: reporter } = await supabase
            .from('profiles')
            .select('first_name, last_name, profile_id')
            .eq('user_id', report.reporter_user_id)
            .maybeSingle();

          const { data: reported } = await supabase
            .from('profiles')
            .select('first_name, last_name, profile_id, is_suspended')
            .eq('user_id', report.reported_user_id)
            .maybeSingle();

          enrichedReports.push({
            ...report,
            reporterName: reporter ? `${reporter.first_name} ${reporter.last_name}` : 'Unknown Reporter',
            reporterId: reporter?.profile_id || 'GV-UNKNOWN',
            reportedName: reported ? `${reported.first_name} ${reported.last_name}` : 'Unknown Suspect',
            reportedId: reported?.profile_id || 'GV-UNKNOWN',
            isSuspended: reported?.is_suspended || false
          });
        }
      }
      setReportsQueue(enrichedReports);

      // 3. Fetch pending photos
      const { data: photos } = await supabase
        .from('gallery_images')
        .select('*');
      
      const enrichedPhotos = [];
      if (photos) {
        for (const photo of photos) {
          const { data: pInfo } = await supabase
            .from('profiles')
            .select('first_name, last_name, profile_id')
            .eq('user_id', photo.user_id)
            .maybeSingle();
          
          enrichedPhotos.push({
            ...photo,
            userName: pInfo ? `${pInfo.first_name} ${pInfo.last_name}` : 'Unknown User',
            userId: pInfo?.profile_id || 'GV-PENDING'
          });
        }
      }
      // Filter out images that are already processed or display all pending
      setPhotosQueue(enrichedPhotos.filter((ph: any) => ph.moderation_status === 'pending' || !ph.moderation_status));

      // 4. Fetch deletion requests
      const { data: deletions } = await supabase
        .from('deletion_requests')
        .select('*');
      
      const enrichedDeletions = [];
      if (deletions) {
        for (const del of deletions) {
          const { data: pInfo } = await supabase
            .from('profiles')
            .select('first_name, last_name, profile_id')
            .eq('user_id', del.user_id)
            .maybeSingle();
          
          enrichedDeletions.push({
            ...del,
            userName: pInfo ? `${pInfo.first_name} ${pInfo.last_name}` : 'Unknown User',
            userId: pInfo?.profile_id || 'GV-PENDING'
          });
        }
      }
      setDeletionQueue(enrichedDeletions.filter((d: any) => d.status === 'pending'));

      // 5. Fetch audit logs (from activity_logs table where action matches MODERATOR)
      const { data: logs } = await supabase
        .from('activity_logs')
        .select('*')
        .ilike('action', '%MODERATOR%')
        .order('created_at', { ascending: false });
      setAuditLogs(logs || []);

    } catch (err) {
      console.error('Error fetching admin moderation queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationData();
  }, []);

  // Action handlers
  const handleApproveProfile = async (profile: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true, moderation_status: 'approved', moderated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (error) throw error;

      // Log moderator action
      await supabase.from('activity_logs').insert({
        action: 'MODERATOR_APPROVE_PROFILE',
        metadata: { target_profile_id: profile.profile_id, target_name: `${profile.first_name} ${profile.last_name}` }
      });

      alert(`Approved profile verification for: ${profile.first_name}`);
      fetchModerationData();
    } catch (e: any) {
      alert('Error approving profile: ' + e.message);
    }
  };

  const handleRejectProfile = async (profile: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ moderation_status: 'rejected', moderated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (error) throw error;

      // Log action
      await supabase.from('activity_logs').insert({
        action: 'MODERATOR_REJECT_PROFILE',
        metadata: { target_profile_id: profile.profile_id }
      });

      alert(`Rejected profile verification for: ${profile.first_name}`);
      fetchModerationData();
    } catch (e: any) {
      alert('Error rejecting profile: ' + e.message);
    }
  };

  const handleApprovePhoto = async (photo: any) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ moderation_status: 'approved', moderated_at: new Date().toISOString() })
        .eq('id', photo.id);

      if (error) throw error;

      // Log action
      await supabase.from('activity_logs').insert({
        action: 'MODERATOR_APPROVE_PHOTO',
        metadata: { image_id: photo.id, target_user_id: photo.user_id }
      });

      alert('Photo approved successfully.');
      fetchModerationData();
    } catch (e: any) {
      alert('Error approving photo: ' + e.message);
    }
  };

  const handleRejectPhoto = async (photo: any) => {
    try {
      // In a real system, we delete the image or mark it rejected
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;

      // Log action
      await supabase.from('activity_logs').insert({
        action: 'MODERATOR_REJECT_PHOTO',
        metadata: { image_id: photo.id, target_user_id: photo.user_id }
      });

      alert('Photo rejected and removed from gallery.');
      fetchModerationData();
    } catch (e: any) {
      alert('Error rejecting photo: ' + e.message);
    }
  };

  const handleSuspendUser = async (userId: string, name: string) => {
    const confirmSuspend = confirm(`Are you sure you want to suspend/ban user ${name}? They will be blocked from accessing the site.`);
    if (!confirmSuspend) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: true, suspended_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;

      // Log action
      await supabase.from('activity_logs').insert({
        action: 'MODERATOR_SUSPEND_USER',
        metadata: { target_user_id: userId, name }
      });

      alert(`Suspended User: ${name}`);
      fetchModerationData();
    } catch (e: any) {
      alert('Error suspending user: ' + e.message);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      // Log action
      await supabase.from('activity_logs').insert({
        action: 'MODERATOR_DISMISS_REPORT',
        metadata: { report_id: reportId }
      });

      alert('Report dismissed.');
      fetchModerationData();
    } catch (e: any) {
      alert('Error dismissing report: ' + e.message);
    }
  };

  const handleProcessErasure = async (request: any) => {
    const confirmErasure = confirm(`WARNING: This will permanently delete user ${request.userName} and all related database records. This action is irreversible. Proceed?`);
    if (!confirmErasure) return;

    try {
      // 1. Delete user profile (cascade deletes galleries, preferences, horoscopes)
      const { error: profileErr } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', request.user_id);
      if (profileErr) throw profileErr;

      // 2. Delete main auth user mock link
      const { error: userErr } = await supabase
        .from('users')
        .delete()
        .eq('id', request.user_id);
      if (userErr) throw userErr;

      // 3. Mark deletion request as completed
      const { error: delErr } = await supabase
        .from('deletion_requests')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', request.id);
      if (delErr) throw delErr;

      // Log action
      await supabase.from('activity_logs').insert({
        action: 'MODERATOR_PERMANENT_ERASURE_COMPLETED',
        metadata: { deleted_user_id: request.user_id, name: request.userName }
      });

      alert('Account and all related personal data permanently erased from database.');
      fetchModerationData();
    } catch (e: any) {
      alert('Error executing erasure: ' + e.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="h-20 border-b border-zinc-800 bg-zinc-900/60 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-gold-500" />
          <div className="flex flex-col">
            <span className="text-base font-serif font-bold text-white">Gokul Vivaham Moderation Center</span>
            <span className="text-[10px] text-zinc-500 font-mono">ROLE: SYSTEM MODERATOR</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="text-xs font-mono text-gold-500 hover:underline">
            [Main Dashboard]
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-gold-450">
              MOD
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 rounded-full border border-zinc-800 hover:bg-zinc-800 text-zinc-400 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* BODY */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-850 text-xs uppercase tracking-widest font-mono">
          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-5 py-3 border-b-2 font-bold cursor-pointer transition-colors ${
              activeTab === 'profiles' 
                ? 'border-gold-500 text-gold-500 bg-zinc-900/30' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Profile Approvals ({profilesQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-5 py-3 border-b-2 font-bold cursor-pointer transition-colors ${
              activeTab === 'reports' 
                ? 'border-gold-500 text-gold-500 bg-zinc-900/30' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Abuse Reports ({reportsQueue.filter(r => !r.isSuspended).length})
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-5 py-3 border-b-2 font-bold cursor-pointer transition-colors ${
              activeTab === 'photos' 
                ? 'border-gold-500 text-gold-500 bg-zinc-900/30' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Photo Queue ({photosQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('deletion')}
            className={`px-5 py-3 border-b-2 font-bold cursor-pointer transition-colors ${
              activeTab === 'deletion' 
                ? 'border-gold-500 text-gold-500 bg-zinc-900/30' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Deletion Requests ({deletionQueue.length})
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-500 font-mono text-xs">
            Fetching verification lists...
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            
            {/* TABS CONTAINER CONTENT */}
            
            {/* 1. PROFILE APPROVALS */}
            {activeTab === 'profiles' && (
              <div className="flex flex-col gap-4">
                {profilesQueue.length > 0 ? (
                  profilesQueue.map((profile) => (
                    <div key={profile.id} className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-left shadow-md">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white font-serif">{profile.first_name} {profile.last_name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold uppercase">{profile.gender}</span>
                          <span className="text-[10px] text-gold-500 font-mono">ID: {profile.profile_id}</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-normal font-light">
                          Age: {profile.age} yrs • Caste: {profile.caste} • Tongue: {profile.mother_tongue} • City: {profile.city}
                        </p>
                        <blockquote className="text-[11px] text-zinc-500 italic mt-2 border-l border-zinc-800 pl-2">
                          "{profile.about_me || 'No description provided.'}"
                        </blockquote>
                      </div>
                      
                      <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                        <button
                          onClick={() => handleRejectProfile(profile)}
                          className="px-3 h-8.5 rounded-lg border border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-950/40 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveProfile(profile)}
                          className="flex items-center gap-1 px-4 h-8.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-white"
                        >
                          <Check className="h-4 w-4" /> Verify Profile
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-850 rounded-2xl bg-zinc-900/20">
                    No pending profile verifications found.
                  </div>
                )}
              </div>
            )}

            {/* 2. ABUSE REPORTS */}
            {activeTab === 'reports' && (
              <div className="flex flex-col gap-4">
                {reportsQueue.length > 0 ? (
                  reportsQueue.map((report) => (
                    <div key={report.id} className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-left shadow-md">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-400">Reporter:</span>
                          <span className="text-xs font-semibold text-zinc-200">{report.reporterName} ({report.reporterId})</span>
                          <span className="text-zinc-600">➔</span>
                          <span className="text-xs font-bold text-red-400">Accused:</span>
                          <span className="text-xs font-semibold text-white">{report.reportedName} ({report.reportedId})</span>
                          {report.isSuspended && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/20 font-bold uppercase tracking-wider">SUSPENDED</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 leading-normal font-light mt-1">
                          <span className="font-semibold text-zinc-300">Complaint Reason:</span> {report.reason}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                        <button
                          onClick={() => handleDismissReport(report.id)}
                          className="px-3 h-8.5 rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-850 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Dismiss
                        </button>
                        {!report.isSuspended && (
                          <button
                            onClick={() => handleSuspendUser(report.reported_user_id, report.reportedName)}
                            className="flex items-center gap-1.5 px-4 h-8.5 rounded-lg bg-red-950/80 border border-red-800 text-red-400 hover:bg-red-900 transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer"
                          >
                            <Ban className="h-4 w-4" /> Suspend Member
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-850 rounded-2xl bg-zinc-900/20">
                    No pending profile abuse reports.
                  </div>
                )}
              </div>
            )}

            {/* 3. PHOTO QUEUE */}
            {activeTab === 'photos' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {photosQueue.length > 0 ? (
                  photosQueue.map((photo) => (
                    <div key={photo.id} className="bg-zinc-900 border border-zinc-850 rounded-2xl overflow-hidden flex flex-col justify-between shadow-md">
                      <div className="p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-serif font-bold text-white truncate max-w-[120px]">{photo.userName}</span>
                          <span className="text-[10px] text-gold-500 font-mono">{photo.userId}</span>
                        </div>
                        {/* Photo Display Container */}
                        <div className="w-full h-44 rounded-xl bg-zinc-950 flex items-center justify-center overflow-hidden border border-zinc-850 mt-1 relative select-none">
                          <img 
                            src={photo.image_url} 
                            alt="Awaiting Moderation" 
                            className="w-full h-full object-cover pointer-events-none"
                          />
                        </div>
                      </div>
                      
                      <div className="p-4 bg-zinc-950/50 border-t border-zinc-850/55 flex justify-between gap-2">
                        <button
                          onClick={() => handleRejectPhoto(photo)}
                          className="flex-1 py-2 rounded-lg border border-red-900/30 text-red-400 hover:bg-red-950/20 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprovePhoto(photo)}
                          className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-white"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-12 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-850 rounded-2xl bg-zinc-900/20">
                    No images pending safety approval.
                  </div>
                )}
              </div>
            )}

            {/* 4. DELETION REQUESTS */}
            {activeTab === 'deletion' && (
              <div className="flex flex-col gap-4">
                {deletionQueue.length > 0 ? (
                  deletionQueue.map((req) => (
                    <div key={req.id} className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-left shadow-md">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white font-serif">{req.userName}</span>
                          <span className="text-[10px] text-gold-500 font-mono">ID: {req.userId}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-bold uppercase">ERASURE REQUEST</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-normal font-light">
                          Requested: {new Date(req.requested_at).toLocaleString()} • Compliance Mandate: DPDP Right of Erasure
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                        <button
                          onClick={() => handleProcessErasure(req)}
                          className="flex items-center gap-1.5 px-4 h-8.5 rounded-lg bg-red-900 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" /> Erase Account Data
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-850 rounded-2xl bg-zinc-900/20">
                    No data deletion/erasure requests pending processing.
                  </div>
                )}
              </div>
            )}

            {/* SYSTEM AUDIT LOGS TRAIL */}
            <div className="h-px bg-zinc-850 my-6" />

            <div className="bg-zinc-900 border border-zinc-850 rounded-2xl shadow-lg p-5 md:p-6 flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <FileText className="h-5 w-5 text-gold-500" />
                <h3 className="text-base font-serif font-bold text-white">System Moderator Audit Trail Logs</h3>
              </div>
              
              {auditLogs.length > 0 ? (
                <div className="flex flex-col gap-2 font-mono text-[10px] text-zinc-400 max-h-[250px] overflow-y-auto pr-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-2 rounded bg-zinc-950 border border-zinc-850 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 select-none">
                      <div>
                        <span className="text-gold-500 font-bold">[{log.action}]</span>
                        <span className="ml-2 text-zinc-300">{JSON.stringify(log.metadata)}</span>
                      </div>
                      <span className="text-zinc-500 text-[9px]">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-zinc-600 text-xs font-mono">
                  No moderation logs registered in current session.
                </div>
              )}
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
