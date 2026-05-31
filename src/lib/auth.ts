import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const isMock = supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder');

export const authLib = {
  verifySession: () => true,

  async getServerUser() {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('sb-access-token')?.value || cookieStore.get('supabase-auth-token')?.value;
      if (!token) return null;

      // Handle Mock Mode JWT Decoding
      if (isMock) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            return {
              id: payload.sub,
              email: payload.email,
              user_metadata: payload.user_metadata,
              role: payload.role
            };
          }
        } catch (e) {}

        // Fallbacks for legacy/simple mock tokens
        if (token === 'mock-demo-token' || token.includes('demo')) {
          return {
            id: 'demo-user-id',
            email: 'demo@gokul.com',
            user_metadata: { role: 'user', full_name: 'Demo User' }
          };
        }
        if (token === 'demo-admin-id' || token.includes('admin')) {
          return {
            id: 'demo-admin-id',
            email: 'admin@gokul.com',
            user_metadata: { role: 'admin', full_name: 'Gokul Admin' }
          };
        }
        return null;
      }

      // Create a fresh request-scoped client for server-side execution to prevent session crossover
      const requestClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      });

      const { data: { user }, error } = await requestClient.auth.getUser(token);
      if (error) {
        console.error('authLib.getServerUser error:', error.message);
        return null;
      }
      if (!user) {
        console.error('authLib.getServerUser: User not found in session');
        return null;
      }

      return user;
    } catch (e: any) {
      console.error('authLib.getServerUser catch error:', e.message);
      return null;
    }
  }
};
