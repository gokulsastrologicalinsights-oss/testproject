import { supabase } from '../supabase/client';

export const authClient = {
  async signUp(email: string, password: string, fullName: string) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'user'
        }
      }
    });
  },

  async signInWithPassword(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  async signInWithOtp(phone: string) {
    return await supabase.auth.signInWithOtp({
      phone
    });
  },

  async verifyOtp(phoneOrEmail: string, token: string, type: 'sms' | 'signup') {
    if (type === 'sms') {
      return await supabase.auth.verifyOtp({
        phone: phoneOrEmail,
        token,
        type: 'sms'
      });
    } else {
      return await supabase.auth.verifyOtp({
        email: phoneOrEmail,
        token,
        type: 'signup'
      });
    }
  },

  async signInWithOAuth(provider: 'google') {
    return await supabase.auth.signInWithOAuth({
      provider
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async resetPasswordForEmail(email: string) {
    return await supabase.auth.resetPasswordForEmail(email);
  }
};
