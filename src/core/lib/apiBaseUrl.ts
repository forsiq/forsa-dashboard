/**
 * Single source for API base URL and origin used by REST client and auth calls.
 * When NEXT_PUBLIC_API_BASE_URL is missing at build time, a relative auth URL would
 * hit the app host (e.g. Amplify) and return 404 — same default as ApiClientFactory.
 */
export const DEFAULT_API_BASE_URL = 'https://test.zonevast.com/forsa/api/v1';

export function getResolvedApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
}

export function getApiOrigin(): string {
  const base = getResolvedApiBaseUrl();
  try {
    return new URL(base).origin;
  } catch {
    return 'https://test.zonevast.com';
  }
}

/** zv-auth-service (Django) — see zv_auth_service/urls.py: api/v1/auth/auth/token/refresh/ */
export const ZV_AUTH_JWT_REFRESH_PATH = '/api/v1/auth/auth/token/refresh/';
