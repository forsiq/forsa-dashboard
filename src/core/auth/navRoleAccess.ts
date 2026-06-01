import type { UserRole } from '@features/auth/types';
import { getNavPathBase } from '@core/utils/isNavItemActive';

export const NAV_ROLE_MAP: Record<string, UserRole[]> = {
  '/moderation': ['admin', 'product_moderator'],
  '/settlements': ['admin'],
  '/users': ['admin'],
  '/settings': ['admin'],
  '/merchants': ['admin'],
  '/live-monitor': ['admin', 'product_analyst'],
  '/listings': ['admin', 'merchant'],
  '/categories': ['admin', 'merchant'],
  '/auctions': ['admin', 'merchant', 'product_analyst'],
  '/group-buying': ['admin', 'merchant', 'product_analyst'],
  '/inventory': ['admin', 'merchant'],
  '/orders': ['admin', 'merchant', 'customer_support'],
  '/customers': ['admin', 'customer_support'],
  '/reports': ['admin', 'merchant', 'product_analyst', 'customer_support'],
  '/reports/customer-insights': ['admin', 'customer_support'],
  '/reports/auction-performance': ['admin', 'merchant', 'product_analyst'],
  '/watchlist': ['admin', 'merchant'],
  /** Consumer/bidder page — not shown in merchant dashboard nav */
  '/my-bids': [],
  '/amazon-import': ['admin', 'merchant'],
};

/** Longest matching NAV_ROLE_MAP prefix wins (e.g. /reports/customer-insights over /reports). */
export function isPathAllowedForRole(path: string, userRole: UserRole): boolean {
  const base = getNavPathBase(path);
  let matchedPrefix: string | null = null;
  for (const prefix of Object.keys(NAV_ROLE_MAP)) {
    if (base === prefix || base.startsWith(`${prefix}/`)) {
      if (!matchedPrefix || prefix.length > matchedPrefix.length) {
        matchedPrefix = prefix;
      }
    }
  }
  if (!matchedPrefix) return true;
  return NAV_ROLE_MAP[matchedPrefix].includes(userRole);
}
