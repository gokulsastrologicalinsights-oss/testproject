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

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/chat/:path*',
    '/subscription/:path*',
    '/verify/:path*',
    '/admin/:path*',
  ],
};
