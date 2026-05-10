/** Path part before `?` (for nav hrefs like `/orders?status=pending`). */
export function getNavPathBase(itemPath: string): string {
  const i = itemPath.indexOf('?');
  return i === -1 ? itemPath : itemPath.slice(0, i);
}

type RouterQuery = Record<string, string | string[] | undefined>;

function itemQueryMatchesRouter(itemPath: string, query: RouterQuery): boolean {
  const q = itemPath.indexOf('?');
  if (q === -1) return true;
  const params = new URLSearchParams(itemPath.slice(q + 1));
  for (const [key, value] of params.entries()) {
    const raw = query[key];
    const fromRouter = raw === undefined ? '' : Array.isArray(raw) ? raw[0] ?? '' : raw;
    if (fromRouter !== value) return false;
  }
  return true;
}

/**
 * True when pathname matches the nav item (exact or nested under item.path).
 */
export function isNavItemActive(pathname: string, itemPath: string): boolean {
  const base = getNavPathBase(itemPath);
  if (pathname === base) return true;
  if (base === '/' || base === '') return false;
  return pathname.startsWith(`${base}/`);
}

/**
 * Among all menu paths, the longest **base** path that matches pathname (exact or prefix).
 * When two items share the same base (e.g. `/orders` vs `/orders?status=pending`), prefers the href **without** query so callers can layer query-aware logic separately.
 */
export function getLongestMatchingNavPath(pathname: string, paths: string[]): string | null {
  const matches = paths.filter(p => isNavItemActive(pathname, p));
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => {
    const ba = getNavPathBase(a).length;
    const bb = getNavPathBase(b).length;
    if (bb !== ba) return bb > ba ? b : a;
    if (a.includes('?') !== b.includes('?')) return a.includes('?') ? b : a;
    return b.length > a.length ? b : a;
  });
}

/**
 * Active nav href including query when items share the same base path (e.g. `/orders` vs `/orders?status=pending`).
 */
export function getActiveSidebarItemPath(
  pathname: string,
  query: RouterQuery,
  paths: string[],
): string | null {
  const candidates = paths.filter(p => isNavItemActive(pathname, p));
  if (candidates.length === 0) return null;

  const longestBase = candidates.reduce((a, b) =>
    getNavPathBase(b).length > getNavPathBase(a).length ? b : a,
  );
  const baseLen = getNavPathBase(longestBase).length;
  const tied = candidates.filter(p => getNavPathBase(p).length === baseLen);
  if (tied.length === 1) return tied[0];

  const score = (p: string): number => {
    let s = p.length;
    if (p.includes('?')) {
      s += itemQueryMatchesRouter(p, query) ? 2000 : -10000;
    } else {
      s += 100;
    }
    return s;
  };

  return tied.reduce((a, b) => (score(b) > score(a) ? b : a));
}
