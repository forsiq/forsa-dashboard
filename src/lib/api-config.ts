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

/**
 * Project attachment API base (includes `/project/project`, no trailing slash).
 * Gateway on test.zonevast.com requires the `/en/` locale prefix.
 */
export function getProjectServiceBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_PROJECT_API_URL?.trim();
  let base = fromEnv
    ? trimTrailingSlash(fromEnv)
    : `${getGatewayOrigin()}/en/api/v1/project/project`;

  if (base.includes('zonevast.com/api/v1/') && !base.includes('/en/api/v1/')) {
    base = base.replace('/api/v1/', '/en/api/v1/');
  }

  // Legacy env: `.../api/v1/project` → full service root
  if (base.endsWith('/project') && !base.endsWith('/project/project')) {
    base = `${base}/project`;
  }

  return base;
}

/** Alias for consistency with developer-platform naming */
export const getProjectApiBase = getProjectServiceBaseUrl;

export function resolveCookieDomain(): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim();
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined' && window.location.hostname.endsWith('zonevast.com')) {
    return '.zonevast.com';
  }

  return undefined;
}
