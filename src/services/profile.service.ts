import { supabase } from '@/lib/supabase';

const isMockMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || url.includes('placeholder') || !key || key.includes('placeholder');
};

export const profileService = {
  async getProfile(userId: string) {
    try {
      if (isMockMode()) {
        return { data: { id: userId, first_name: "Revathi", last_name: "S." }, error: null };
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async createUser(userData: { id: string; auth_user_id: string; email: string; mobile_number: string }) {
    try {
      if (isMockMode()) {
        return { data: userData, error: null };
      }
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userData.id,
          auth_user_id: userData.auth_user_id,
          email: userData.email,
          mobile_number: userData.mobile_number,
          role: 'user',
          status: 'active'
        })
        .select()
        .single();
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async createProfile(profileData: any) {
    try {
      if (isMockMode()) {
        return { data: profileData, error: null };
      }
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async updateProfile(userId: string, data: any) {
    try {
      if (isMockMode()) {
        return { data: { success: true }, error: null };
      }
      const { data: updated, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', userId)
        .select()
        .single();
      return { data: updated, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async createPartnerPreferences(prefData: any) {
    try {
      if (isMockMode()) {
        return { data: prefData, error: null };
      }
      const { data, error } = await supabase
        .from('partner_preferences')
        .insert(prefData)
        .select()
        .single();
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  async createHoroscopeUpload(uploadData: { user_id: string; file_url: string; file_name: string; file_type: string }) {
    try {
      if (isMockMode()) {
        return { data: uploadData, error: null };
      }
      const { data, error } = await supabase
        .from('horoscope_uploads')
        .insert(uploadData)
        .select()
        .single();
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },
  
  async createGalleryImage(imageData: { user_id: string; image_url: string; is_profile_picture: boolean; is_private: boolean }) {
    try {
      if (isMockMode()) {
        return { data: imageData, error: null };
      }
      const { data, error } = await supabase
        .from('gallery_images')
        .insert(imageData)
        .select()
        .single();
      return { data, error };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
};
