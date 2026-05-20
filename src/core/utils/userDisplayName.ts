/** Display-name helpers for flex-auth / auction-service user fields. */

const PLACEHOLDER_USER_RE = /^User [0-9a-f]{8}$/i;

export function isPlaceholderUserLabel(name?: string | null): boolean {
  if (!name?.trim()) return false;
  return PLACEHOLDER_USER_RE.test(name.trim());
}

export function formatBidderDisplayName(raw: Record<string, unknown>): string {
  const explicit = raw.bidderName ?? raw.bidder_name;
  if (typeof explicit === 'string' && explicit.trim() && !isPlaceholderUserLabel(explicit)) {
    return explicit.trim();
  }

  const first = String(raw.bidderFirstName ?? raw.bidder_first_name ?? '').trim();
  const last = String(raw.bidderLastName ?? raw.bidder_last_name ?? '').trim();
  const full = [first, last].filter(Boolean).join(' ');
  if (full) return full;

  const phone = String(raw.bidderPhone ?? raw.phone ?? '').trim();
  if (phone) return phone;

  const id = String(raw.bidderId ?? raw.bidder_id ?? '').trim();
  if (id.length > 12) return `${id.slice(0, 8)}…`;
  return id;
}

export function resolveCustomerDisplayName(raw: Record<string, unknown>): string {
  const candidates = [
    raw.name,
    raw.fullName,
    raw.full_name,
    raw.displayName,
    raw.display_name,
    [raw.firstName, raw.lastName].filter(Boolean).join(' '),
    [raw.first_name, raw.last_name].filter(Boolean).join(' '),
  ];

  for (const value of candidates) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed || isPlaceholderUserLabel(trimmed)) continue;
    return trimmed;
  }

  const phone = String(raw.phone ?? raw.phone_number ?? raw.mobile ?? '').trim();
  if (phone) return phone;

  const email = String(raw.email ?? raw.primary_email ?? '').trim();
  if (email) return email;

  const id = String(raw.id ?? '').trim();
  if (id.length > 12) return `${id.slice(0, 8)}…`;
  return id || '—';
}
