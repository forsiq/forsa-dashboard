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
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define public routes
  const isPublicPath = 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname === '/otp' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/public') ||
    pathname === '/favicon.ico';

  // 2. Check authentication token in cookies
  const token = request.cookies.get('access')?.value;

  // 3. Protection Logic
  if (!isPublicPath && !token) {
    // Redirect to login if trying to access protected route without token
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // 4. Prevent logged-in users from accessing login/register
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
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
