import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

const isMock = supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder');

const realSupabase = createClient(supabaseUrl, supabaseKey);

// Setup Mock Auth state
let currentSession: any = null;
let listeners: Array<(event: string, session: any) => void> = [];

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('gokul_mock_session');
    if (saved) {
      currentSession = JSON.parse(saved);
    }
  } catch (e) {}
}

const notifyListeners = (event: string, session: any) => {
  listeners.forEach((l) => {
    try {
      l(event, session);
    } catch (e) {}
  });
};

const setSession = (session: any) => {
  currentSession = session;
  if (typeof window !== 'undefined') {
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
    if (session) {
      localStorage.setItem('gokul_mock_session', JSON.stringify(session));
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureFlag}`;
    } else {
      localStorage.removeItem('gokul_mock_session');
      document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
    }
  }
  notifyListeners(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
};

const mockAuth = {
  signUp: async ({ email, password, options }: any) => {
    const user = {
      id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
      email,
      user_metadata: options?.data || { role: 'user', full_name: 'Mock User' }
    };
    const session = {
      access_token: 'mock-token-' + Math.random().toString(36).substr(2, 9),
      user
    };
    if (typeof window !== 'undefined') {
      try {
        const users = JSON.parse(localStorage.getItem('gokul_mock_users') || '[]');
        if (!users.some((u: any) => u.email === email)) {
          users.push({ ...user, password });
          localStorage.setItem('gokul_mock_users', JSON.stringify(users));
        }
      } catch (e) {}
    }
    setSession(session);
    return { data: { user, session }, error: null };
  },

  signInWithPassword: async ({ email, password }: any) => {
    if (typeof window !== 'undefined') {
      try {
        const users = JSON.parse(localStorage.getItem('gokul_mock_users') || '[]');
        const found = users.find((u: any) => u.email === email);
        if (found) {
          if (found.password === password) {
            const session = {
              access_token: 'mock-token-' + Math.random().toString(36).substr(2, 9),
              user: { id: found.id, email: found.email, user_metadata: found.user_metadata }
            };
            setSession(session);
            return { data: { user: session.user, session }, error: null };
          } else {
            return { data: null, error: new Error('Invalid password') };
          }
        }
      } catch (e) {}
    }

    if (email === 'demo@gokul.com' && password === '123456') {
      const session = {
        access_token: 'mock-demo-token',
        user: {
          id: 'demo-user-id',
          email: 'demo@gokul.com',
          user_metadata: { role: 'user', full_name: 'Demo User' }
        }
      };
      setSession(session);
      return { data: { user: session.user, session }, error: null };
    }

    return { data: null, error: new Error('User not found. Try registering first or use demo@gokul.com / 123456.') };
  },

  signInWithOtp: async ({ phone }: any) => {
    return { data: { message: 'Demo OTP sent' }, error: null };
  },

  verifyOtp: async (params: any) => {
    const token = params.token;
    if (token === '1234' || token === '123456') {
      const session = {
        access_token: 'mock-otp-token',
        user: {
          id: 'demo-user-id',
          email: params.email || 'demo@gokul.com',
          user_metadata: { role: 'user', full_name: 'Demo User' }
        }
      };
      setSession(session);
      return { data: { user: session.user, session }, error: null };
    }
    return { data: null, error: new Error('Invalid OTP') };
  },

  signInWithOAuth: async ({ provider }: any) => {
    const session = {
      access_token: 'mock-oauth-token',
      user: {
        id: 'demo-oauth-id',
        email: 'oauth@gokul.com',
        user_metadata: { role: 'user', full_name: 'OAuth User' }
      }
    };
    setSession(session);
    return { data: { url: '/dashboard' }, error: null };
  },

  signOut: async () => {
    setSession(null);
    return { error: null };
  },

  getSession: async () => {
    return { data: { session: currentSession }, error: null };
  },

  getUser: async () => {
    return { data: { user: currentSession?.user || null }, error: null };
  },

  onAuthStateChange: (callback: any) => {
    listeners.push(callback);
    try {
      callback('INITIAL_SESSION', currentSession);
    } catch (e) {}
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            listeners = listeners.filter((l) => l !== callback);
          }
        }
      }
    };
  }
};

export const supabase = isMock
  ? new Proxy(realSupabase, {
      get(target, prop) {
        if (prop === 'auth') {
          return mockAuth;
        }
        return (target as any)[prop];
      }
    })
  : realSupabase;
