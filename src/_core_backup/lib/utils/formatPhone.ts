/**
 * Format a phone number for display.
 *
 * +9647501111111 → +964 750 111 1111
 * +966500000000  → +966 50 000 0000
 * 07501111111    → +964 750 111 1111  (auto-prefix Iraq)
 *
 * Falls back to the raw value if parsing fails.
 */
export function formatPhone(raw: string | null | undefined): string {
  if (!raw) return '';

  // Strip spaces/dashes
  const digits = raw.replace(/[\s\-()]/g, '');

  // Already has country code
  if (digits.startsWith('+')) {
    return prettyPrint(digits);
  }

  // Local Iraqi number starting with 07
  if (digits.startsWith('07') && digits.length === 11) {
    return prettyPrint('+964' + digits.slice(1));
  }

  // Already well-formed international without +
  if (digits.startsWith('964') && digits.length === 13) {
    return prettyPrint('+' + digits);
  }

  return raw;
}

/**
 * Compact phone display for tight table cells.
 * +9647501111111 → +964 ••• 1111
 */
export function formatPhoneCompact(raw: string | null | undefined): string {
  if (!raw) return '';

  const digits = raw.replace(/[\s\-()]/g, '');
  const cleaned = digits.startsWith('+') ? digits : '+' + digits;

  if (cleaned.length >= 8) {
    const countryCode = extractCountryCode(cleaned);
    const lastFour = cleaned.slice(-4);
    return `${countryCode} ••• ${lastFour}`;
  }

  return raw;
}

// ─── Helpers ────────────────────────────────────────────────────────

function prettyPrint(intl: string): string {
  // +964XXXXXXXXXX → +964 7XX XXX XXXX
  if (intl.startsWith('+964') && intl.length === 14) {
    return `${intl.slice(0, 4)} ${intl.slice(4, 7)} ${intl.slice(7, 10)} ${intl.slice(10)}`;
  }
  // +966XXXXXXXXX → +966 5X XXX XXXX
  if (intl.startsWith('+966') && intl.length === 13) {
    return `${intl.slice(0, 4)} ${intl.slice(4, 6)} ${intl.slice(6, 9)} ${intl.slice(9)}`;
  }
  // Generic: group in chunks of 3 from the right
  const plus = intl.startsWith('+') ? '+' : '';
  const d = intl.replace('+', '');
  const groups: string[] = [];
  let remaining = d;
  while (remaining.length > 0) {
    const take = Math.min(3, remaining.length);
    groups.unshift(remaining.slice(-take));
    remaining = remaining.slice(0, -take);
  }
  return plus + groups.join(' ');
}

function extractCountryCode(intl: string): string {
  // Known single-digit country codes
  if (intl.startsWith('+1')) return '+1';
  // Known 3-digit
  for (const code of ['+964', '+966', '+971', '+973', '+965', '+968', '+974', '+20', '+962', '+963', '+961', '+960', '+962']) {
    if (intl.startsWith(code)) return code;
  }
  // Default: take first 4 chars
  return intl.slice(0, 4);
}
