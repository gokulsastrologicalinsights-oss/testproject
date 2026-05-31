'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Check, X, Ban, Flag, ShieldAlert, Trash2, 
  User, Image, FileText, LogOut, Bell, ShieldCheck, CheckCircle2, ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { verificationService } from '@/services/verification.service';
import { uploadService } from '@/services/upload.service';
import { safetyService } from '@/services/safety.service';

export default function AdminApprovalsPage() {
  const router = useRouter();

  // Navigation states
  const [activeTab, setActiveTab] = useState<'profiles' | 'verifications' | 'reports' | 'photos' | 'deletion'>('verifications');
  const [loading, setLoading] = useState(true);

  // Data states
  const [profilesQueue, setProfilesQueue] = useState<any[]>([]);
  const [verificationsQueue, setVerificationsQueue] = useState<any[]>([]);
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

      // 2. Fetch pending document verifications
      const { data: verifs } = await verificationService.adminGetPendingRequests();
      setVerificationsQueue(verifs || []);

      // 3. Fetch abuse reports
      const { data: reports } = await safetyService.adminGetAbuseReports();
      setReportsQueue(reports || []);

      // 4. Fetch pending photos
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

      // 5. Fetch deletion requests
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

      // 6. Fetch audit logs (from activity_logs table where action matches MODERATOR)
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

  const handleProcessVerification = async (req: any, status: 'approved' | 'rejected' | 'resubmit_requested') => {
    let reason = '';
    if (status === 'rejected' || status === 'resubmit_requested') {
      const promptMsg = status === 'rejected' ? 'Enter rejection reason:' : 'Enter resubmission instructions for user:';
      const val = prompt(promptMsg);
      if (val === null) return;
      if (!val.trim()) {
        alert('Reason is required.');
        return;
      }
      reason = val.trim();
    }

    try {
      const { success, error } = await verificationService.adminProcessRequest(
        req.id,
        req.user_id,
        req.verification_type,
        status,
        reason
      );

      if (error) throw error;
      alert(`Verification request status updated to ${status}.`);
      fetchModerationData();
    } catch (e: any) {
      alert('Error processing request: ' + e.message);
    }
  };

  const handleViewDocument = async (req: any) => {
    const bucket = req.verification_type === 'id_proof' ? 'id-proofs' : 'horoscopes';
    try {
      const { url, error } = await uploadService.getSignedUrl(bucket, req.document_url);
      if (error || !url) throw error || new Error('Could not generate signed URL');
      window.open(url, '_blank');
    } catch (e: any) {
      alert('Error opening document: ' + e.message);
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

  const handleProcessSafetyAction = async (report: any, action: 'warn' | 'suspend' | 'ban' | 'dismiss') => {
    let notes = '';
    if (action !== 'dismiss') {
      const promptNotes = `Enter moderator notes / reason for safety action: ${action.toUpperCase()}`;
      const val = prompt(promptNotes);
      if (val === null) return;
      notes = val.trim();
    } else {
      const confirmDismiss = confirm('Are you sure you want to dismiss this abuse report?');
      if (!confirmDismiss) return;
    }

    try {
      const { success, error } = await safetyService.adminProcessReportAction(
        report.id,
        report.reported_user_id,
        action,
        notes
      );

      if (error) throw error;
      alert(`Safety action ${action.toUpperCase()} completed successfully.`);
      fetchModerationData();
    } catch (e: any) {
      alert('Error applying action: ' + e.message);
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
    await useAuthStore.getState().logout();
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
        <div className="flex border-b border-zinc-850 text-xs uppercase tracking-widest font-mono flex-wrap">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-5 py-3 border-b-2 font-bold cursor-pointer transition-colors ${
              activeTab === 'verifications' 
                ? 'border-gold-500 text-gold-500 bg-zinc-900/30' 
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Doc Verifications ({verificationsQueue.length})
          </button>
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
            
            {/* 0. DOCUMENT VERIFICATIONS */}
            {activeTab === 'verifications' && (
              <div className="flex flex-col gap-4">
                {verificationsQueue.length > 0 ? (
                  verificationsQueue.map((req) => (
                    <div key={req.id} className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-left shadow-md">
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white font-serif">{req.first_name} {req.last_name}</span>
                          <span className="text-[10px] text-gold-500 font-mono">ID: {req.profile_id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            req.verification_type === 'id_proof' ? 'bg-blue-950 text-blue-400 border border-blue-900/30' : 'bg-amber-955 text-amber-400 border border-amber-900/30'
                          }`}>
                            {req.verification_type === 'id_proof' ? 'ID Proof' : 'Horoscope'}
                          </span>
                          <span className="text-[10px] text-zinc-400">({req.document_type})</span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-normal font-light">
                          Email: {req.email} • Submitted: {new Date(req.created_at).toLocaleString()}
                        </p>
                        
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            onClick={() => handleViewDocument(req)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 text-[10px] font-semibold tracking-wide uppercase transition-colors cursor-pointer select-none"
                          >
                            <FileText className="h-3.5 w-3.5" /> View Submitted Document <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                        <button
                          onClick={() => handleProcessVerification(req, 'resubmit_requested')}
                          className="px-3 h-8.5 rounded-lg border border-orange-900/30 bg-orange-950/20 text-orange-400 hover:bg-orange-950/40 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Resubmit
                        </button>
                        <button
                          onClick={() => handleProcessVerification(req, 'rejected')}
                          className="px-3 h-8.5 rounded-lg border border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-950/40 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleProcessVerification(req, 'approved')}
                          className="flex items-center gap-1 px-4 h-8.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-white"
                        >
                          <Check className="h-4 w-4" /> Approve
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-850 rounded-2xl bg-zinc-900/20">
                    No pending document verifications found.
                  </div>
                )}
              </div>
            )}

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
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="font-bold text-zinc-550">Reporter:</span>
                          <span className="font-semibold text-zinc-200">{report.reporter_name || report.reporterName} ({report.reporter_profile_id || report.reporterId})</span>
                          <span className="text-zinc-650">➔</span>
                          <span className="font-bold text-red-400">Accused:</span>
                          <span className="font-semibold text-white">{report.reported_name || report.reportedName} ({report.reported_profile_id || report.reportedId})</span>
                          
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400">
                            {report.report_type === 'message' ? 'Message Flag' : 'Profile Flag'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-red-950/40 text-red-400 border border-red-900/10">
                            {report.category}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 leading-normal font-light mt-1.5">
                          <span className="font-semibold text-zinc-350">Reason:</span> {report.reason}
                        </p>

                        {/* Display flagged message if message report */}
                        {report.report_type === 'message' && report.reported_message_text && (
                          <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl mt-2 max-w-xl">
                            <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider font-mono">Flagged Chat Message:</span>
                            <blockquote className="text-xs text-zinc-305 italic mt-1 font-serif">
                              "{report.reported_message_text}"
                            </blockquote>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 self-start md:self-center shrink-0 flex-wrap max-w-xs md:max-w-none">
                        <button
                          onClick={() => handleProcessSafetyAction(report, 'dismiss')}
                          className="px-3 h-8.5 rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-850 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleProcessSafetyAction(report, 'warn')}
                          className="px-3 h-8.5 rounded-lg border border-amber-900/30 bg-amber-950/20 text-amber-500 hover:bg-amber-950/40 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Warn
                        </button>
                        <button
                          onClick={() => handleProcessSafetyAction(report, 'suspend')}
                          className="px-3 h-8.5 rounded-lg border border-orange-900/30 bg-orange-950/20 text-orange-400 hover:bg-orange-950/40 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Suspend
                        </button>
                        <button
                          onClick={() => handleProcessSafetyAction(report, 'ban')}
                          className="px-4 h-8.5 rounded-lg bg-red-650 hover:bg-red-750 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
                        >
                          Ban
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-zinc-500 font-mono text-xs border border-dashed border-zinc-850 rounded-2xl bg-zinc-900/20">
                    No pending abuse reports found.
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
