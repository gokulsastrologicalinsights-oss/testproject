import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define route lists
  const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/chat') || path.startsWith('/subscription') || path.startsWith('/verify');
  const isAdminRoute = path.startsWith('/admin') && path !== '/admin/login';

  // Retrieve auth token from cookies
  const token = request.cookies.get('sb-access-token')?.value || request.cookies.get('supabase-auth-token')?.value;
  const isLoggedIn = !!token;

  console.log('[Proxy Routing Debug]', { path, isLoggedIn, hasToken: !!token, tokenSnippet: token ? token.substring(0, 10) + '...' : null });

  if (isProtectedRoute && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
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
