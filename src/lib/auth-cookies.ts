/**
 * Auth cookie helpers — fixes Chrome duplicate cookies (host-only vs .zonevast.com).
 */
import Cookies from 'js-cookie';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_COOKIE,
  setAccessTokenWithExpiry,
  setRefreshTokenWithExpiry,
  setUser,
  clearAuthCookies,
  getUser,
} from '@core/lib';
import { resolveCookieDomain } from './api-config';

const AUTH_NAMES = [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, USER_COOKIE] as const;

function removeCookieEveryScope(name: string, domain?: string): void {
  Cookies.remove(name, { path: '/' });
  if (!domain) return;
  Cookies.remove(name, { path: '/', domain });
  if (domain.startsWith('.')) {
    Cookies.remove(name, { path: '/', domain: domain.slice(1) });
  }
}

/** Remove auth cookies from host-only and domain-scoped storage. */
export function clearAllAuthCookies(domain?: string): void {
  const d = domain ?? resolveCookieDomain();
  for (const name of AUTH_NAMES) {
    removeCookieEveryScope(name, d);
    removeCookieEveryScope(name, undefined);
  }
  clearAuthCookies(d);
}

export function persistAuthSession(
  access: string,
  refresh: string,
  user: { id: string; username: string; email?: string },
  domain?: string,
): void {
  const d = domain ?? resolveCookieDomain();
  clearAllAuthCookies(d);
  setAccessTokenWithExpiry(access, d);
  setRefreshTokenWithExpiry(refresh, d);
  setUser(user, d);
}

/**
 * Chrome may keep an old host-only `access` cookie while a new `.zonevast.com` cookie exists.
 * Normalize once on app load so AuthGuard reads a single valid token.
 */
export function migrateAuthCookiesToSharedDomain(domain?: string): void {
  if (typeof window === 'undefined') return;
  const d = domain ?? resolveCookieDomain();
  if (!d) return;

  const access = Cookies.get(ACCESS_TOKEN_COOKIE);
  const refresh = Cookies.get(REFRESH_TOKEN_COOKIE);
  if (!access && !refresh) return;

  const userObj = getUser();
  clearAllAuthCookies(d);

  if (access) setAccessTokenWithExpiry(access, d);
  if (refresh) setRefreshTokenWithExpiry(refresh, d);
  if (userObj) setUser(userObj, d);
}
