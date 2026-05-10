/**
 * Parse optional price fields from deploy listing forms (string state).
 * Never returns 0: the API treats 0 as present and @Min(1) fails on optional buyNow/reserve.
 */
export function parseOptionalListingPrice(raw: unknown): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || raw < 1) return undefined;
    return raw;
  }
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 1) return undefined;
  return n;
}

/** Required start price from number or string input. */
export function parseRequiredListingPrice(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const n = Number(raw.trim());
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

/** Bid increment: fall back to default when field cleared or invalid. */
export function parseBidIncrement(raw: unknown, fallback: number): number {
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 1) return fallback;
  return n;
}
