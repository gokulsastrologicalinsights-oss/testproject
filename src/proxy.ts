import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ROLE_LEVELS: Record<string, number> = {
  user: 1,
  free: 1,
  premium_user: 2,
  silver: 2,
  gold: 2,
  platinum: 2,
  moderator: 3,
  admin: 4,
  super_admin: 5,
};

function decodeJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define route lists
  const isProtectedRoute = 
    path.startsWith('/dashboard') || 
    path.startsWith('/profile/edit') || 
    path.startsWith('/chat') || 
    path.startsWith('/subscription') || 
    path.startsWith('/verify');
  const isAdminRoute = path.startsWith('/admin') && path !== '/admin/login';

  // Retrieve auth token from cookies
  const token = request.cookies.get('sb-access-token')?.value || request.cookies.get('supabase-auth-token')?.value;

  let isLoggedIn = false;
  let role = 'user';

  if (token) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const isMock = !supabaseUrl || supabaseUrl.includes('placeholder');

    if (!isMock && supabaseUrl && supabaseKey) {
      // 1. In Real Mode, call Supabase auth.getUser() to verify signature & expiration
      try {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          }
        });
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          isLoggedIn = true;
          role = user.user_metadata?.role || user.app_metadata?.role || 'user';
        }
      } catch (err) {
        console.error('Middleware Supabase auth error:', err);
      }
    } else {
      // 2. In Mock Mode, decode the mock JWT and check expiration
      const payload = decodeJwt(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload && (!payload.exp || payload.exp >= currentTime)) {
        isLoggedIn = true;
        role = payload.user_metadata?.role || payload.app_metadata?.role || payload.role || 'user';
      }
    }
  }

  console.log('[Proxy Routing Debug]', { path, isLoggedIn, role });

  // Handle redirect if not authenticated
  if (isProtectedRoute && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const response = NextResponse.redirect(url);
    const secureFlag = request.nextUrl.protocol === 'https:' ? '; Secure' : '';
    response.headers.set('Set-Cookie', `sb-access-token=; path=/; max-age=0; SameSite=Lax${secureFlag}`);
    return response;
  }

  if (isAdminRoute && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    const response = NextResponse.redirect(url);
    const secureFlag = request.nextUrl.protocol === 'https:' ? '; Secure' : '';
    response.headers.set('Set-Cookie', `sb-access-token=; path=/; max-age=0; SameSite=Lax${secureFlag}`);
    return response;
  }

  // Role-based Access Control checks
  if (isLoggedIn) {
    const roleLevel = ROLE_LEVELS[role] || 1;

    // 1. Admin/Moderator protection (level >= 3 required)
    if (isAdminRoute && roleLevel < 3) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // 2. Premium chat protection (level >= 2 required)
    const isChatRoute = path === '/chat' || path.startsWith('/chat/') || path === '/dashboard/chat' || path.startsWith('/dashboard/chat/');
    if (isChatRoute && roleLevel < 2) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard/subscription';
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next();

  // Add Compliance Security HTTP Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.ipify.org; frame-ancestors 'none';"
  );
  
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
