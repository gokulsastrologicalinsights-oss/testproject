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

class MockQueryBuilder {
  private tableName: string;
  private filters: Array<(item: any) => boolean> = [];
  private isSingle = false;
  private isMaybeSingle = false;
  private limitCount = 0;
  private insertData: any = null;
  private updateData: any = null;
  private doDelete = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private getStorageKey() {
    return `gokul_mock_${this.tableName}`;
  }

  private getData() {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.getStorageKey());
      if (data) return JSON.parse(data);
    } catch (e) {}

    // Seed defaults
    if (this.tableName === 'admin_users') {
      return [{
        id: 'admin-user-id',
        auth_user_id: 'demo-admin-id',
        full_name: 'Gokul Admin',
        email: 'admin@gokul.com',
        role: 'admin'
      }];
    }
    return [];
  }

  private saveData(data: any) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
    } catch (e) {}
  }

  select(columns?: string, options?: any) {
    return this;
  }

  insert(data: any) {
    this.insertData = data;
    return this;
  }

  update(data: any) {
    this.updateData = data;
    return this;
  }

  delete() {
    this.doDelete = true;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item: any) => item[column] === value);
    return this;
  }

  or(expr: string) {
    const parts = expr.split(',');
    this.filters.push((item: any) => {
      return parts.some(part => {
        const subparts = part.trim().split('.');
        const col = subparts[0];
        const op = subparts[1];
        const val = subparts[2];
        if (op === 'eq') {
          return item[col] === val;
        }
        return false;
      });
    });
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((item: any) => values.includes(item[column]));
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push((item: any) => item[column] >= value);
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push((item: any) => item[column] <= value);
    return this;
  }

  ilike(column: string, pattern: string) {
    const regex = new RegExp(pattern.replace(/%/g, '.*'), 'i');
    this.filters.push((item: any) => regex.test(item[column]));
    return this;
  }

  order(column: string, options?: any) {
    return this;
  }

  limit(value: number) {
    this.limitCount = value;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const result = await this.execute();
      if (onfulfilled) return onfulfilled(result);
      return result;
    } catch (e) {
      if (onrejected) return onrejected(e);
      throw e;
    }
  }

  private async execute() {
    let items = this.getData();

    if (this.insertData) {
      const dataArray = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
      const inserted = dataArray.map(d => ({
        id: d.id || Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        ...d
      }));
      items.push(...inserted);
      this.saveData(items);
      return { data: Array.isArray(this.insertData) ? inserted : inserted[0], error: null };
    }

    if (this.updateData) {
      items = items.map((item: any) => {
        const matches = this.filters.every((f: any) => f(item));
        if (matches) {
          return { ...item, ...this.updateData };
        }
        return item;
      });
      this.saveData(items);
      const updated = items.filter((item: any) => this.filters.every((f: any) => f(item)));
      return { data: this.isSingle || this.isMaybeSingle ? updated[0] || null : updated, error: null };
    }

    if (this.doDelete) {
      const remaining = items.filter((item: any) => !this.filters.every((f: any) => f(item)));
      this.saveData(remaining);
      return { data: null, error: null };
    }

    let filtered = items.filter((item: any) => this.filters.every((f: any) => f(item)));

    if (this.limitCount > 0) {
      filtered = filtered.slice(0, this.limitCount);
    }

    if (this.isSingle) {
      if (filtered.length === 0) {
        return { data: null, error: { message: 'Row not found' } };
      }
      return { data: filtered[0], error: null };
    }

    if (this.isMaybeSingle) {
      return { data: filtered[0] || null, error: null };
    }

    return { data: filtered, error: null };
  }
}

export const supabase = isMock
  ? new Proxy(realSupabase, {
      get(target, prop) {
        if (prop === 'auth') {
          return mockAuth;
        }
        if (prop === 'from') {
          return (tableName: string) => new MockQueryBuilder(tableName);
        }
        return (target as any)[prop];
      }
    })
  : realSupabase;
