import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { queryClient } from '@/lib/query/query-client';
import { useProfileStore } from './profileStore';
import { useMatchStore } from './matchStore';
import { useChatStore } from './chatStore';
import { useNotificationStore } from './notificationStore';
import { useSubscriptionStore } from './subscriptionStore';
import { useAdminStore } from './adminStore';

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
    // Only call signOut if a session exists to prevent infinite callbacks
    const currentSession = useAuthStore.getState().session;
    if (currentSession) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase signOut error:', err);
      }
    }

    // 1. Reset other Zustand stores to avoid stale state crossover/leak on logout
    useProfileStore.setState({ profile: null });
    useMatchStore.setState({ matches: [] });
    useChatStore.setState({ conversations: [], activeChat: null });
    useNotificationStore.setState({ notifications: [] });
    useSubscriptionStore.setState({ plan: 'Free' });
    useAdminStore.setState({ users: [] });

    // 2. Clear React Query cache
    try {
      queryClient.clear();
    } catch (err) {
      console.error('Failed to clear React Query cache:', err);
    }

    // 3. Clear localStorage, sessionStorage, and cookies
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (err) {
        console.error('Storage clear error:', err);
      }

      const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax${secureFlag}`;

      // 4. Redirect to login page
      const isAdmin = window.location.pathname.startsWith('/admin');
      window.location.href = isAdmin ? '/admin/login' : '/login';
    }

    set({ user: null, session: null, role: 'user', loading: false });
  }
}));
