import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type RouteRoleConfig = {
  roles: string[];
  redirectPath: string;
};

const ADMIN_ONLY_ROLES = ['admin'];

/** Must match ForsaSidebar ROLE_MAP for /reports (+ legacy JWT role `manager`). */
const REPORTS_ACCESS_ROLES = [
  'admin',
  'manager',
  'merchant',
  'customer_support',
  'product_analyst',
];

/** Matches ForsaSidebar: admin + product_analyst (+ legacy manager). */
const LIVE_MONITOR_ACCESS_ROLES = ['admin', 'manager', 'product_analyst'];

const PROTECTED_ROUTES: Record<string, RouteRoleConfig> = {
  '/moderation': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/settlements': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/users': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/settings': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/live-monitor': { roles: LIVE_MONITOR_ACCESS_ROLES, redirectPath: '/dashboard' },
  '/reports': { roles: REPORTS_ACCESS_ROLES, redirectPath: '/dashboard' },
};

const parseJwtPayload = (token?: string): Record<string, unknown> | null => {
  if (!token) return null;
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return null;
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const payloadJson = atob(padded);
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
};

const parseJwtExp = (token?: string): number | null => {
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  return typeof payload.exp === 'number' ? payload.exp : null;
};

const decodeJwtRole = (token: string): string | null => {
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  if (payload.role && typeof payload.role === 'string') return payload.role.toLowerCase();
  if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
    return (payload.roles[0] as string).toLowerCase();
  }
  return 'user';
};

const isTokenValid = (token?: string): boolean => {
  if (!token) return false;
  const exp = parseJwtExp(token);
  if (!exp) return false;
  return Date.now() < (exp - 30) * 1000;
};

function matchRoute(pathname: string, routePrefix: string): boolean {
  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Define public routes
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

  // 2. Check authentication token in cookies
  const token = request.cookies.get('access')?.value;
  const hasValidToken = isTokenValid(token);

  // 3. Protection Logic - redirect to login if unauthenticated on protected paths
  if (!isPublicPath && !hasValidToken) {
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
  if ((pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') && hasValidToken && !isForcedLogin) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 5. Role-based route protection
  if (hasValidToken && token) {
    let matchedConfig: RouteRoleConfig | null = null;
    for (const [routePrefix, config] of Object.entries(PROTECTED_ROUTES)) {
      if (matchRoute(pathname, routePrefix)) {
        matchedConfig = config;
        break;
      }
    }

    if (matchedConfig) {
      const role = decodeJwtRole(token) || 'user';
      if (!matchedConfig.roles.includes(role)) {
        return NextResponse.redirect(new URL(matchedConfig.redirectPath, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
