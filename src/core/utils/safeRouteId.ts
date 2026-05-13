/**
 * Returns true if `id` is safe to embed in a URL path segment (avoids blob:/data:/http: leaks from bad API data).
 */
export function isSafePathResourceId(id: unknown): boolean {
  if (id == null) return false;
  const s = String(id).trim();
  if (!s || s.length > 80) return false;
  if (/^(blob|data|https?|file):/i.test(s)) return false;
  if (s.includes('//') || s.includes('?') || s.includes('#')) return false;
  return /^[\w.-]+$/.test(s);
}
