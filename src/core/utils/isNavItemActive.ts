/**
 * True when pathname matches the nav item (exact or nested under item.path).
 */
export function isNavItemActive(pathname: string, itemPath: string): boolean {
  if (pathname === itemPath) return true;
  if (itemPath === '/' || itemPath === '') return false;
  return pathname.startsWith(`${itemPath}/`);
}

/**
 * Among all menu paths, the longest path that matches pathname (exact or prefix).
 * Used so e.g. /reports/analytics only highlights that item, not /reports.
 */
export function getLongestMatchingNavPath(pathname: string, paths: string[]): string | null {
  const matches = paths.filter(p => isNavItemActive(pathname, p));
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => (b.length > a.length ? b : a));
}
