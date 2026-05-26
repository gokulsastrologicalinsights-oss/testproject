import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';

export interface AuthState {
  user: any;
  session: any;
  role: string;
  loading: boolean;
  setUser: (user: any) => void;
  setSession: (session: any) => void;
  setRole: (role: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  role: 'user',
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session, user: session?.user || null }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, role: 'user', loading: false });
  }
}));
