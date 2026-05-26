/**
 * Shared API / cookie config for Forsa dashboard (auction2).
 */

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getGatewayOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_GATEWAY_ORIGIN?.trim();
  if (fromEnv) return trimTrailingSlash(fromEnv);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (apiBase) {
    try {
      return new URL(apiBase).origin;
    } catch {
      /* fall through */
    }
  }

  return 'https://test.zonevast.com';
}

/** Project attachment API base (axios `baseURL`, no trailing slash). */
export function getProjectServiceBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_PROJECT_API_URL?.trim();
  if (fromEnv) {
    const base = trimTrailingSlash(fromEnv);
    return base.includes('/project/project')
      ? base.replace(/\/project\/project\/?$/, '')
      : base;
  }
  return `${getGatewayOrigin()}/api/v1`;
}

export function resolveCookieDomain(): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim();
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined' && window.location.hostname.endsWith('zonevast.com')) {
    return '.zonevast.com';
  }

  return undefined;
}
