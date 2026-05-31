import { supabase } from '@/lib/supabase';

const isMockMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || url.includes('placeholder') || !key || key.includes('placeholder');
};

export interface VerificationRequest {
  id: string;
  user_id: string;
  verification_type: 'id_proof' | 'horoscope';
  document_type: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected' | 'resubmit_requested';
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  // Enriched fields for admin view
  profile_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export const verificationService = {
  async submitVerificationRequest(
    type: 'id_proof' | 'horoscope',
    documentUrl: string,
    documentType?: string
  ) {
    try {
      if (isMockMode()) {
        console.log(`[Verification Service] Mock Mode: Submitting ${type} request. URL: ${documentUrl}`);
        return { data: { success: true }, error: null };
      }

      // 1. Get logged-in user auth ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: new Error('User not authenticated') };

      // 2. Get user database ID
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!userRow) return { data: null, error: new Error('User row not found') };
      const currentUserId = userRow.id;

      // 3. Check if there is an existing pending request of this type
      const { data: existing } = await supabase
        .from('verification_requests')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('verification_type', type)
        .eq('status', 'pending')
        .maybeSingle();

      let requestResult;
      if (existing) {
        // Update the existing pending request
        const { data, error } = await supabase
          .from('verification_requests')
          .update({
            document_url: documentUrl,
            document_type: documentType || (type === 'horoscope' ? 'Horoscope' : 'ID Proof'),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        requestResult = data;
      } else {
        // Create new request
        const { data, error } = await supabase
          .from('verification_requests')
          .insert({
            user_id: currentUserId,
            verification_type: type,
            document_type: documentType || (type === 'horoscope' ? 'Horoscope' : 'ID Proof'),
            document_url: documentUrl,
            status: 'pending'
          })
          .select()
          .single();
        if (error) throw error;
        requestResult = data;
      }

      // 4. Update the profile status
      const profileUpdates: any = {};
      if (type === 'id_proof') {
        profileUpdates.id_verification_status = 'pending';
        profileUpdates.id_verification_document_url = documentUrl;
        profileUpdates.id_verification_type = documentType || 'ID Proof';
        profileUpdates.id_verification_rejection_reason = null;
      } else {
        profileUpdates.horoscope_verification_status = 'pending';
        profileUpdates.horoscope_verification_rejection_reason = null;

        // Also update horoscope_uploads table
        await supabase
          .from('horoscope_uploads')
          .delete()
          .eq('user_id', currentUserId);

        await supabase
          .from('horoscope_uploads')
          .insert({
            user_id: currentUserId,
            file_url: documentUrl,
            file_name: 'horoscope.pdf',
            file_type: 'application/pdf'
          });
      }

      const { error: profileErr } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('user_id', currentUserId);

      if (profileErr) throw profileErr;

      return { data: requestResult, error: null };
    } catch (err: any) {
      console.error('Error submitting verification request:', err);
      return { data: null, error: err };
    }
  },

  async getMyVerificationRequests() {
    try {
      if (isMockMode()) {
        return {
          data: [
            {
              id: 'req-mock-1',
              verification_type: 'id_proof',
              document_type: 'Aadhaar',
              document_url: 'https://gokul-vivaham.supabase/mock_id_proof.pdf',
              status: 'approved',
              created_at: new Date(Date.now() - 86400000 * 5).toISOString()
            }
          ] as any[],
          error: null
        };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: [], error: new Error('User not authenticated') };

      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!userRow) return { data: [], error: new Error('User row not found') };

      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userRow.id)
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (err: any) {
      console.error('Error fetching verification requests:', err);
      return { data: [], error: err };
    }
  },

  async verifyEmailOrMobile(field: 'email' | 'mobile', value: string) {
    try {
      if (isMockMode()) {
        console.log(`[Verification Service] Mock verify ${field}: ${value}`);
        return { data: { success: true }, error: null };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: new Error('User not authenticated') };

      const updates: any = {};
      if (field === 'email') {
        updates.email_verified = true;
        updates.email = value;
      } else {
        updates.mobile_verified = true;
        updates.mobile_number = value;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('auth_user_id', user.id)
        .select()
        .single();

      return { data, error };
    } catch (err: any) {
      console.error(`Error verifying ${field}:`, err);
      return { data: null, error: err };
    }
  },

  // Admin APIs
  async adminGetPendingRequests() {
    try {
      if (isMockMode()) {
        return {
          data: [
            {
              id: 'req-1',
              user_id: 'mock-user-5',
              verification_type: 'id_proof',
              document_type: 'PAN Card',
              document_url: 'https://gokul-vivaham.supabase/mock_pan.pdf',
              status: 'pending',
              created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
              profile_id: 'GV100205',
              first_name: 'Srinivasan',
              last_name: 'K.',
              email: 'srinivasan@example.com'
            },
            {
              id: 'req-2',
              user_id: 'mock-user-6',
              verification_type: 'horoscope',
              document_type: 'Horoscope',
              document_url: 'https://gokul-vivaham.supabase/mock_horoscope_srinivasan.pdf',
              status: 'pending',
              created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
              profile_id: 'GV100206',
              first_name: 'Meenakshi',
              last_name: 'N.',
              email: 'meenakshi@example.com'
            }
          ] as any[],
          error: null
        };
      }

      // Fetch all pending requests from database
      const { data: requests, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error || !requests || requests.length === 0) {
        return { data: [], error };
      }

      // Enrich with profile and user email
      const enrichedRequests = await Promise.all(
        requests.map(async (req) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, profile_id')
            .eq('user_id', req.user_id)
            .maybeSingle();

          const { data: user } = await supabase
            .from('users')
            .select('email')
            .eq('id', req.user_id)
            .maybeSingle();

          return {
            ...req,
            profile_id: profile?.profile_id || 'GV-UNKNOWN',
            first_name: profile?.first_name || 'Unknown',
            last_name: profile?.last_name || 'Member',
            email: user?.email || 'N/A'
          };
        })
      );

      return { data: enrichedRequests, error: null };
    } catch (err: any) {
      console.error('Error fetching admin verification queue:', err);
      return { data: [], error: err };
    }
  },

  async adminProcessRequest(
    requestId: string,
    targetUserId: string,
    type: 'id_proof' | 'horoscope',
    status: 'approved' | 'rejected' | 'resubmit_requested',
    reason?: string
  ) {
    try {
      if (isMockMode()) {
        console.log(`[Verification Admin] Mock Processing request ${requestId}. Status: ${status}, Reason: ${reason}`);
        return { success: true, error: null };
      }

      // 1. Get logged-in admin auth ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: new Error('Admin not authenticated') };

      // 2. Resolve admin database ID
      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      const adminId = adminRow?.id || null;

      // 3. Update the verification request
      const { error: reqErr } = await supabase
        .from('verification_requests')
        .update({
          status,
          rejection_reason: reason || null,
          reviewed_by: adminId,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (reqErr) throw reqErr;

      // 4. Update the user profile state
      const profileUpdates: any = {};
      if (type === 'id_proof') {
        profileUpdates.id_verification_status = status;
        profileUpdates.id_verification_rejection_reason = reason || null;
        if (status === 'approved') {
          profileUpdates.is_verified = true;
        } else {
          profileUpdates.is_verified = false;
        }
      } else {
        profileUpdates.horoscope_verification_status = status;
        profileUpdates.horoscope_verification_rejection_reason = reason || null;
      }

      const { error: profileErr } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('user_id', targetUserId);

      if (profileErr) throw profileErr;

      // 5. Add Activity Log
      await supabase.from('activity_logs').insert({
        action: `MODERATOR_PROCESS_VERIFICATION_${type.toUpperCase()}_${status.toUpperCase()}`,
        metadata: {
          request_id: requestId,
          target_user_id: targetUserId,
          status,
          reason
        }
      });

      // 6. Optional: Create notifications for the user
      let title = '';
      let message = '';
      if (status === 'approved') {
        title = `${type === 'id_proof' ? 'ID Proof' : 'Horoscope'} Approved`;
        message = `Congratulations! Your ${type === 'id_proof' ? 'identity verification' : 'horoscope document'} has been approved by our administrators.`;
      } else if (status === 'rejected') {
        title = `${type === 'id_proof' ? 'ID Proof' : 'Horoscope'} Rejected`;
        message = `Your ${type === 'id_proof' ? 'identity verification' : 'horoscope document'} has been rejected. Reason: ${reason || 'Does not match criteria'}.`;
      } else if (status === 'resubmit_requested') {
        title = `Resubmission Requested for ${type === 'id_proof' ? 'ID Proof' : 'Horoscope'}`;
        message = `Our moderators requested a resubmission of your ${type === 'id_proof' ? 'ID Proof' : 'Horoscope'}. Reason: ${reason || 'Incorrect file format or blur'}. Please re-upload.`;
      }

      await supabase.from('notifications').insert({
        user_id: targetUserId,
        title,
        message,
        type: `verification_${type}_${status}`,
        is_read: false
      });

      return { success: true, error: null };
    } catch (err: any) {
      console.error('Error processing verification request by admin:', err);
      return { success: false, error: err };
    }
  }
};
