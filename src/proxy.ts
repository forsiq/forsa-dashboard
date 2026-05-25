import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  decodeJwtPayload,
  extractDashboardRole,
  isDashboardRoleAllowed,
} from './core/auth/dashboardRole';
import type { UserRole } from './features/auth/types';

type RouteRoleConfig = {
  roles: readonly UserRole[];
  redirectPath: string;
};

const ADMIN_ONLY_ROLES: readonly UserRole[] = ['admin'];

/** Matches ForsaSidebar ROLE_MAP for /reports */
const REPORTS_ACCESS_ROLES: readonly UserRole[] = [
  'admin',
  'merchant',
  'customer_support',
  'product_analyst',
];

/** Matches ForsaSidebar: admin + product_analyst */
const LIVE_MONITOR_ACCESS_ROLES: readonly UserRole[] = ['admin', 'product_analyst'];

const PROTECTED_ROUTES: Record<string, RouteRoleConfig> = {
  '/moderation': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/settlements': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/users': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/settings': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/live-monitor': { roles: LIVE_MONITOR_ACCESS_ROLES, redirectPath: '/dashboard' },
  '/reports': { roles: REPORTS_ACCESS_ROLES, redirectPath: '/dashboard' },
  '/auctions/add': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/auctions/clone': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/auctions/edit': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/group-buying/new': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
  '/group-buying/edit': { roles: ADMIN_ONLY_ROLES, redirectPath: '/dashboard' },
};

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

function matchRoute(pathname: string, routePrefix: string): boolean {
  return pathname === routePrefix || pathname.startsWith(`${routePrefix}/`);
}

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

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
  const hasValidToken = isTokenValid(token);

  if (!isPublicPath && !hasValidToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    const response = NextResponse.redirect(url);
    response.cookies.delete('access');
    response.cookies.delete('refresh');
    response.cookies.delete('zv_user');
    return response;
  }

  const isForcedLogin = searchParams.get('expired') === 'true';
  if (
    (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') &&
    hasValidToken &&
    !isForcedLogin
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (hasValidToken && token) {
    let matchedConfig: RouteRoleConfig | null = null;
    for (const [routePrefix, config] of Object.entries(PROTECTED_ROUTES)) {
      if (matchRoute(pathname, routePrefix)) {
        matchedConfig = config;
        break;
      }
    }

    if (matchedConfig) {
      const payload = decodeJwtPayload(token);
      const dashboardRole = extractDashboardRole(payload);
      if (!isDashboardRoleAllowed(matchedConfig.roles, dashboardRole)) {
        return NextResponse.redirect(new URL(matchedConfig.redirectPath, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
