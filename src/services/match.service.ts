import { supabase } from '@/lib/supabase';

const isMockMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || url.includes('placeholder') || !key || key.includes('placeholder');
};

export const matchService = {
  async getMatches(filters?: {
    gender?: string;
    ageMin?: number;
    ageMax?: number;
    religion?: string;
    caste?: string;
    rasi?: string;
    star?: string;
    location?: string;
  }) {
    try {
      if (isMockMode()) {
        return { data: [
          {
            id: 'GVV-089',
            name: 'Gokulakrishnan M.',
            gender: 'Male',
            age: 28,
            height_cm: 178,
            religion: 'Hindu',
            caste: 'Iyer',
            sub_caste: 'Vadama',
            rasi: 'Dhanusu',
            nakshatra: 'Pooradam',
            gothram: 'Bharadwaj',
            city: 'Bangalore',
            native_place: 'Thanjavur',
            education: 'MBA Project Manager',
            company_name: 'TCS',
            annual_income: 1400000,
            about_me: 'A simple, modern individual who values family traditions. Enjoys travel, South Indian music, and reading.',
            family_type: 'Nuclear',
            siblings: '1 sister (married)',
            is_verified: true,
            is_premium: true,
            marital_status: 'Never Married',
            score: 95
          },
          {
            id: 'GVV-045',
            name: 'Venkatesh Prasad S.',
            gender: 'Male',
            age: 30,
            height_cm: 174,
            religion: 'Hindu',
            caste: 'Iyer',
            sub_caste: 'Vadama',
            rasi: 'Mesham',
            nakshatra: 'Aswini',
            gothram: 'Srivatsa',
            city: 'Chennai',
            native_place: 'Madurai',
            education: 'MS Cloud Architect',
            company_name: 'Cognizant',
            annual_income: 1800000,
            about_me: 'Career-oriented but down-to-earth. Respects values and loves visiting temples. Looking for a compatible life partner.',
            family_type: 'Joint',
            siblings: 'None',
            is_verified: true,
            is_premium: false,
            marital_status: 'Never Married',
            score: 88
          },
          {
            id: 'GVV-112',
            name: 'Karthik N.',
            gender: 'Male',
            age: 27,
            height_cm: 180,
            religion: 'Hindu',
            caste: 'Iyer',
            sub_caste: 'Brahacharanam',
            rasi: 'Simham',
            nakshatra: 'Pooram',
            gothram: 'Koundinya',
            city: 'Singapore',
            native_place: 'Tiruchirappalli',
            education: 'B.Tech Tech Lead',
            company_name: 'Grab',
            annual_income: 1200000,
            about_me: 'Living in Singapore for 4 years. Warm-hearted, vegetarian, loves cooking, and values transparency in relationships.',
            family_type: 'Nuclear',
            siblings: '1 younger brother',
            is_verified: true,
            is_premium: true,
            marital_status: 'Never Married',
            score: 91
          },
          {
            id: 'GVV-088',
            name: 'Soundarya S.',
            gender: 'Female',
            age: 26,
            height_cm: 163,
            religion: 'Hindu',
            caste: 'Iyer',
            sub_caste: 'Vadama',
            rasi: 'Simham',
            nakshatra: 'Pooram',
            gothram: 'Kasyapa',
            city: 'Chennai',
            native_place: 'Mylapore',
            education: 'B.Tech Software Engineer',
            company_name: 'Amazon',
            annual_income: 1600000,
            about_me: 'Traditional at heart with a progressive outlook. Passionate about Classical dance and software design.',
            family_type: 'Nuclear',
            siblings: '1 younger brother',
            is_verified: true,
            is_premium: true,
            marital_status: 'Never Married',
            score: 92
          },
          {
            id: 'GVV-145',
            name: 'Priya Narayanan',
            gender: 'Female',
            age: 27,
            height_cm: 160,
            religion: 'Hindu',
            caste: 'Pillai',
            sub_caste: 'Saiva Pillai',
            rasi: 'Rishabham',
            nakshatra: 'Krittika',
            gothram: 'Siva Gothram',
            city: 'Madurai',
            native_place: 'Tirunelveli',
            education: 'M.Com Bank Manager',
            company_name: 'SBI',
            annual_income: 900000,
            about_me: 'Loving, family-centered person. Loves traditional cooking and values relationship boundaries.',
            family_type: 'Joint',
            siblings: '1 sister (married)',
            is_verified: true,
            is_premium: false,
            marital_status: 'Never Married',
            score: 85
          }
        ], error: null };
      }

      let currentUserId: string | null = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userRow } = await supabase
            .from('users')
            .select('id')
            .eq('auth_user_id', user.id)
            .maybeSingle();
          currentUserId = userRow?.id || user.id;
        }
      } catch (err) {
        console.error('Error getting user in getMatches:', err);
      }

      // 0. Fetch blocklist to exclude blocked candidates
      let blockedUserIds: string[] = [];
      if (currentUserId) {
        const { data: blocks } = await supabase
          .from('blocked_users')
          .select('blocker_user_id, blocked_user_id')
          .or(`blocker_user_id.eq.${currentUserId},blocked_user_id.eq.${currentUserId}`);
        
        if (blocks) {
          blockedUserIds = blocks.map((b: any) => b.blocker_user_id === currentUserId ? b.blocked_user_id : b.blocker_user_id);
        }
      }

      let query = supabase.from('profiles').select('*, users(email_verified, mobile_verified)');
      if (currentUserId) {
        query = query.neq('user_id', currentUserId);
      }

      if (filters) {
        if (filters.gender) query = query.eq('gender', filters.gender);
        if (filters.ageMin) query = query.gte('age', filters.ageMin);
        if (filters.ageMax) query = query.lte('age', filters.ageMax);
        if (filters.religion) query = query.eq('religion', filters.religion);
        if (filters.caste) query = query.ilike('caste', `%${filters.caste}%`);
        if (filters.rasi) query = query.eq('rasi', filters.rasi);
        if (filters.star) query = query.ilike('nakshatra', `%${filters.star}%`);
        if (filters.location) query = query.ilike('city', `%${filters.location}%`);
      }

      const { data, error } = await query;
      
      // format profiles data to standard view structure
      const formatted = (data as any)?.map((profile: any) => ({
        id: profile.profile_id || profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        gender: profile.gender,
        age: profile.age,
        height_cm: profile.height_cm,
        religion: profile.religion,
        caste: profile.caste,
        sub_caste: profile.sub_caste,
        rasi: profile.rasi,
        nakshatra: profile.nakshatra,
        gothram: profile.gothram,
        city: profile.city,
        native_place: profile.native_place,
        education: profile.education,
        company_name: profile.company_name,
        annual_income: profile.annual_income,
        about_me: profile.about_me,
        family_type: profile.family_type,
        siblings: profile.siblings,
        is_verified: profile.is_verified,
        is_premium: profile.is_premium,
        marital_status: profile.marital_status,
        score: 85, // Default compatibility score
        user_id: profile.user_id,
        email_verified: profile.users?.email_verified || false,
        mobile_verified: profile.users?.mobile_verified || false,
        id_verification_status: profile.id_verification_status || (profile.is_verified ? 'approved' : 'none'),
        horoscope_verification_status: profile.horoscope_verification_status || 'none'
      }));

      return { data: formatted ? formatted.filter((p: any) => !blockedUserIds.includes(p.user_id)) : [], error };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },

  async sendRequest(receiverUserId: string) {
    try {
      if (isMockMode()) {
        return { data: { success: true }, error: null };
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      const currentUserId = userRow?.id || user.id;

      // Check blocks
      const { data: block } = await supabase
        .from('blocked_users')
        .select('id')
        .or(`and(blocker_user_id.eq.${currentUserId},blocked_user_id.eq.${receiverUserId}),and(blocker_user_id.eq.${receiverUserId},blocked_user_id.eq.${currentUserId})`)
        .maybeSingle();

      if (block) {
        throw new Error('Cannot send connection request to a blocked member.');
      }

      const { data, error } = await supabase
        .from('match_requests')
        .insert({
          sender_user_id: currentUserId,
          receiver_user_id: receiverUserId,
          status: 'pending'
        })
        .select()
        .single();
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async getPendingRequests() {
    try {
      if (isMockMode()) {
        return { data: [
          { id: '101', name: 'Pranesh Kumar', age: 29, education: 'Doctor (MD)', location: 'Coimbatore', star: 'Uthiradam', score: 85 }
        ], error: null };
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      const currentUserId = userRow?.id || user.id;

      const { data: requests, error: reqError } = await supabase
        .from('match_requests')
        .select('*')
        .eq('receiver_user_id', currentUserId)
        .eq('status', 'pending');
      
      if (reqError || !requests || requests.length === 0) {
        return { data: [], error: reqError };
      }

      const senderIds = requests.map(r => r.sender_user_id);
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', senderIds);

      const formatted = requests.map(req => {
        const profile = profiles?.find(p => p.user_id === req.sender_user_id);
        return {
          id: req.id,
          name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown Member',
          age: profile?.age || 28,
          education: profile?.education || 'N/A',
          location: profile?.city || 'N/A',
          star: profile?.nakshatra || 'N/A',
          score: 85,
          sender_user_id: req.sender_user_id
        };
      });

      return { data: formatted, error: profError };
    } catch (err: any) {
      return { data: [], error: err };
    }
  },

  async respondToRequest(requestId: string, status: 'accepted' | 'declined') {
    try {
      if (isMockMode()) {
        return { data: { success: true }, error: null };
      }
      const { data, error } = await supabase
        .from('match_requests')
        .update({ status })
        .eq('id', requestId)
        .select()
        .single();
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
};
