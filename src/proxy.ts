import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Route Protection
 *
 * Logic:
 * 1. Define public paths that don't need auth
 * 2. Check for 'access' cookie
 * 3. Redirect to login if unauthenticated on protected paths
 */
export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const parseJwtExp = (token?: string): number | null => {
    if (!token) return null;
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return null;
      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const payloadJson = atob(padded);
      const payload = JSON.parse(payloadJson) as { exp?: number };
      return typeof payload.exp === 'number' ? payload.exp : null;
    } catch {
      return null;
    }
  };

  const isTokenValid = (token?: string): boolean => {
    if (!token) return false;
    const exp = parseJwtExp(token);
    if (!exp) return false;
    return Date.now() < (exp - 30) * 1000;
  };

  // 1. Define public routes
  const isPublicPath =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/otp' ||
    pathname === '/zvs.config.json' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/public') ||
    pathname === '/favicon.ico';

  // 2. Check authentication token in cookies
  const token = request.cookies.get('access')?.value;
  const hasValidToken = isTokenValid(token);

  // 3. Protection Logic
  if (!isPublicPath && !hasValidToken) {
    // Redirect to login if trying to access protected route without token
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    const response = NextResponse.redirect(url);
    response.cookies.delete('access');
    response.cookies.delete('refresh');
    response.cookies.delete('zv_user');
    return response;
  }

  // 4. Prevent logged-in users from accessing login/register
  const isForcedLogin = searchParams.get('expired') === 'true';
  if ((pathname === '/login' || pathname === '/register') && hasValidToken && !isForcedLogin) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
