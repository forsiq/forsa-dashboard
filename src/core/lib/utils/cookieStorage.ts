import Cookies from 'js-cookie';

/**
 * Get the cookie domain for cross-app cookie sharing
 */
function getCookieDomain(): string | undefined {
  const hostname = window.location.hostname;

  // For localhost, don't set domain
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return undefined;
  }

  // For production, use the parent domain
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join('.')}`;
  }

  return undefined;
}

/**
 * Shared cookie storage utility for cross-app settings
 * All apps use the same cookie names and domain for consistent behavior
 */

const isSecure = window.location.protocol === 'https:';

// Cookie options for cross-app sharing
const getCookieOptions = (): Cookies.CookieAttributes => {
  const cookieDomain = getCookieDomain();
  return {
    path: '/',
    sameSite: 'lax',
    secure: isSecure,
    ...(cookieDomain ? { domain: cookieDomain } : {})
  };
};

// Theme cookie
export const THEME_COOKIE = 'zv_theme';

export function getTheme(): 'light' | 'dark' {
  const saved = Cookies.get(THEME_COOKIE);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(theme: 'light' | 'dark') {
  Cookies.set(THEME_COOKIE, theme, getCookieOptions());
}

// Language cookie
export const LANGUAGE_COOKIE = 'zv_language';

export function getLanguage(): 'en' | 'ar' | 'ku' {
  const saved = Cookies.get(LANGUAGE_COOKIE);
  if (saved === 'en' || saved === 'ar' || saved === 'ku') return saved;
  return 'en';
}

export function setLanguage(language: 'en' | 'ar' | 'ku') {
  Cookies.set(LANGUAGE_COOKIE, language, getCookieOptions());
}

// Auth cookies - for token storage with priority over localStorage
export const ACCESS_TOKEN_COOKIE = 'access';
export const REFRESH_TOKEN_COOKIE = 'refresh';
export const USER_COOKIE = 'zv_user';

export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_COOKIE);
}

export function setAccessToken(token: string): void {
  Cookies.set(ACCESS_TOKEN_COOKIE, token, getCookieOptions());
}

export function removeAccessToken(): void {
  Cookies.remove(ACCESS_TOKEN_COOKIE, { ...getCookieOptions(), path: '/' });
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_COOKIE);
}

export function setRefreshToken(token: string): void {
  Cookies.set(REFRESH_TOKEN_COOKIE, token, getCookieOptions());
}

export function removeRefreshToken(): void {
  Cookies.remove(REFRESH_TOKEN_COOKIE, { ...getCookieOptions(), path: '/' });
}

export function getUser(): { id: string; username: string; email?: string } | null {
  const userStr = Cookies.get(USER_COOKIE);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function setUser(user: { id: string; username: string; email?: string }): void {
  Cookies.set(USER_COOKIE, JSON.stringify(user), getCookieOptions());
}

export function removeUser(): void {
  Cookies.remove(USER_COOKIE, { ...getCookieOptions(), path: '/' });
}

// Clear all auth cookies
export function clearAuthCookies(): void {
  removeAccessToken();
  removeRefreshToken();
  removeUser();
}

// Check if user is authenticated (cookie priority, fallback to localStorage)
export function isAuthenticated(): boolean {
  return getAccessToken() !== undefined || localStorage.getItem('access_token') !== null;
}
