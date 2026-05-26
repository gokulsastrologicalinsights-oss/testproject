import { supabase } from '@/lib/supabase';

const isMockMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || url.includes('placeholder') || !key || key.includes('placeholder');
};

export const adminService = {
  async getAuditLogs() {
    return [];
  },

  async getAdminStats() {
    try {
      if (isMockMode()) {
        return { data: {
          totalUsers: 1420,
          newRegistrations: 28,
          premiumMembers: 312,
          pendingApprovals: 8,
          horoscopesPending: 12,
          activeMatches: 654,
          revenueThisMonth: 148500
        }, error: null };
      }

      const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
      const { count: pendingApprovals } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', false);
      const { count: premiumMembers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true);
      const { count: horoscopesPending } = await supabase.from('horoscope_uploads').select('*', { count: 'exact', head: true });

      const { data: subscriptions } = await supabase.from('subscriptions').select('plan_id, payment_status');
      const revenueThisMonth = (subscriptions || [])
        .filter(s => s.payment_status === 'Completed')
        .length * 4999;

      return {
        data: {
          totalUsers: totalUsers || 0,
          newRegistrations: 28,
          premiumMembers: premiumMembers || 0,
          pendingApprovals: pendingApprovals || 0,
          horoscopesPending: horoscopesPending || 0,
          activeMatches: 654,
          revenueThisMonth
        },
        error: null
      };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async getPendingProfiles() {
    try {
      if (isMockMode()) {
        return { data: [
          { id: 1, name: 'Srinivasan K.', age: 27, gender: 'Male', caste: 'Iyer', location: 'Chennai', date: '2 hours ago' },
          { id: 2, name: 'Meenakshi N.', age: 24, gender: 'Female', caste: 'Pillai', location: 'Madurai', date: '4 hours ago' },
          { id: 3, name: 'Balaji R.', age: 29, gender: 'Male', caste: 'Naidu', location: 'Bangalore', date: '1 day ago' },
          { id: 4, name: 'Gayathri S.', age: 25, gender: 'Female', caste: 'Chettiar', location: 'Coimbatore', date: '1 day ago' }
        ], error: null };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_verified', false);
      
      const formatted = data?.map(p => ({
        id: p.id,
        user_id: p.user_id,
        name: `${p.first_name} ${p.last_name}`,
        age: p.age,
        gender: p.gender,
        caste: p.caste,
        location: p.city,
        date: 'Recently'
      }));

      return { data: formatted || [], error };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },

  async approveProfile(userId: string) {
    try {
      if (isMockMode()) {
        return { success: true };
      }
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('user_id', userId);
      return { data, error };
    } catch (err: any) {
      return { error: err };
    }
  },

  async getPendingHoroscopes() {
    try {
      if (isMockMode()) {
        return { data: [
          { id: 101, name: 'Venkatesh Prasad', star: 'Aswini', rasi: 'Mesham', url: '#', date: '5 hours ago' },
          { id: 102, name: 'Anitha Gopalan', star: 'Krittika', rasi: 'Rishabham', url: '#', date: '1 day ago' }
        ], error: null };
      }

      const { data: uploads, error: uploadErr } = await supabase
        .from('horoscope_uploads')
        .select('*');
      
      if (uploadErr || !uploads || uploads.length === 0) {
        return { data: [], error: uploadErr };
      }

      const userIds = uploads.map(u => u.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      const formatted = uploads.map(u => {
        const profile = profiles?.find(p => p.user_id === u.user_id);
        return {
          id: u.id,
          name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown Member',
          star: profile?.nakshatra || 'N/A',
          rasi: profile?.rasi || 'N/A',
          url: u.file_url,
          date: 'Recently'
        };
      });

      return { data: formatted, error: null };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },

  async verifyHoroscope(uploadId: string) {
    try {
      if (isMockMode()) {
        return { success: true };
      }
      const { error } = await supabase
        .from('horoscope_uploads')
        .delete()
        .eq('id', uploadId);
      return { success: !error, error };
    } catch (err: any) {
      return { success: false, error: err };
    }
  },

  async getTransactions() {
    try {
      if (isMockMode()) {
        return { data: [
          { id: 'TXN10023', user: 'Ramesh Sundar', plan: 'Gold Elite', date: 'May 24, 2026', amount: '₹4,999', status: 'Completed' },
          { id: 'TXN10022', user: 'Lakshmi Narayanan', plan: 'Diamond Premium', date: 'May 23, 2026', amount: '₹8,999', status: 'Completed' },
          { id: 'TXN10021', user: 'Vijay Kumar', plan: 'Gold Elite', date: 'May 23, 2026', amount: '₹4,999', status: 'Completed' }
        ], error: null };
      }

      const { data: subs, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error || !subs || subs.length === 0) {
        return { data: [], error };
      }

      const userIds = subs.map(s => s.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      const formatted = subs.map(s => {
        const profile = profiles?.find(p => p.user_id === s.user_id);
        return {
          id: s.razorpay_payment_id || s.id.substring(0, 8).toUpperCase(),
          user: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown User',
          plan: 'Premium Pack',
          date: new Date(s.created_at).toLocaleDateString(),
          amount: `₹${s.payment_status === 'Completed' ? '4,999' : '0'}`,
          status: s.payment_status
        };
      });

      return { data: formatted, error: null };
    } catch (err: any) {
      return { data: [], error: err };
    }
  }
};
