import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type RouteRoleConfig = {
  roles: string[];
  redirectPath: string;
};

const ADMIN_ONLY_ROLES = ['admin'];
const MANAGER_PLUS_ROLES = ['admin', 'manager'];

const PROTECTED_ROUTES: Record<string, RouteRoleConfig> = {
  '/moderation': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/settlements': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/users': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/settings': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/live-monitor': { roles: MANAGER_PLUS_ROLES, redirectPath: '/dashboard' },
  '/reports': { roles: MANAGER_PLUS_ROLES, redirectPath: '/dashboard' },
};

const PUBLIC_ROUTES = ['/login', '/register', '/otp', '/forgot-password'];

function decodeJwtRole(token: string): string | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString('binary')
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const payload = JSON.parse(jsonPayload);

    if (payload.role) return payload.role.toLowerCase();
    if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
      return payload.roles[0].toLowerCase();
    }
    return 'user';
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString('binary')
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function matchRoute(pathname: string, routePrefix: string): boolean {
  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some(route => matchRoute(pathname, route))) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // static assets
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('access')?.value;

  // Find matching protected route config
  let matchedConfig: RouteRoleConfig | null = null;
  for (const [routePrefix, config] of Object.entries(PROTECTED_ROUTES)) {
    if (matchRoute(pathname, routePrefix)) {
      matchedConfig = config;
      break;
    }
  }

  // If no specific role config, only check authentication
  if (!matchedConfig) {
    if (!accessToken || isTokenExpired(accessToken)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Route has role requirements - must have token
  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isTokenExpired(accessToken)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role
  const role = decodeJwtRole(accessToken) || 'user';
  if (!matchedConfig.roles.includes(role)) {
    const redirectUrl = new URL(matchedConfig.redirectPath, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|images/).*)',
  ],
};
