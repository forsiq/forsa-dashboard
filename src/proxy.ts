import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwtPayload } from './core/auth/dashboardRole';

const parseJwtExp = (token?: string): number | null => {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  return typeof payload.exp === 'number' ? payload.exp : null;
};

const isTokenValid = (token?: string): boolean => {
  if (!token) return false;
  const exp = parseJwtExp(token);
  if (!exp) return false;
  return Date.now() < (exp - 30) * 1000;
};

/** Allow client AuthGuard to refresh when access expired but refresh is still valid. */
function hasAuthSession(request: NextRequest): boolean {
  const access = request.cookies.get('access')?.value;
  const refresh = request.cookies.get('refresh')?.value;
  if (isTokenValid(access)) return true;
  if (isTokenValid(refresh)) return true;
  return false;
}

function isPrefetchRequest(request: NextRequest): boolean {
  if (request.headers.get('purpose') === 'prefetch') return true;
  if (request.headers.get('x-middleware-prefetch') === '1') return true;
  if (request.headers.get('x-nextjs-data') === '1') return true;
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Next.js data / Chrome prefetch may omit cookies — do not treat as logged out.
  if (pathname.startsWith('/_next/data') || isPrefetchRequest(request)) {
    return NextResponse.next();
  }

  const isPublicPath =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/otp' ||
    pathname === '/forgot-password' ||
    pathname === '/zvs.config.json' ||
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/public') ||
    pathname === '/favicon.ico';

  const token = request.cookies.get('access')?.value;
  const hasValidAccess = isTokenValid(token);
  const sessionOk = hasAuthSession(request);

  if (!isPublicPath && !sessionOk) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    // Do not delete cookies here — breaks Chrome after login and clears refresh token.
    return NextResponse.redirect(url);
  }

  const isForcedLogin = searchParams.get('expired') === 'true';
  if (
    (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') &&
    hasValidAccess &&
    !isForcedLogin
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
