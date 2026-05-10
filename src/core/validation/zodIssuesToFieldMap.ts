import type { ZodError } from 'zod';

/** First path segment → message (flat field-level UI). */
export function zodIssuesToFieldMap(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const seg = issue.path[0];
    const key = seg !== undefined && seg !== null ? String(seg) : '_form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
