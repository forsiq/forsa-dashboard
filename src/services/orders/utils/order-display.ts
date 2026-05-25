/** Display helpers for orders (customer name, status labels). */

const UNKNOWN_LITERALS = new Set(['unknown', 'n/a', 'na', '-']);

export function pickOrderWinnerName(raw: Record<string, unknown>): string {
  const candidates = [
    raw.winnerName,
    raw.winner_name,
    raw.customerName,
    raw.customer_name,
  ];
  for (const value of candidates) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed || UNKNOWN_LITERALS.has(trimmed.toLowerCase())) continue;
    return trimmed;
  }

  const phone = String(raw.winnerPhone ?? raw.winner_phone ?? '').trim();
  if (phone) return phone;

  return '';
}

export function formatOrderCustomerName(
  name: string | undefined,
  t: (key: string) => string,
): string {
  const trimmed = name?.trim();
  if (!trimmed || UNKNOWN_LITERALS.has(trimmed.toLowerCase())) {
    return t('orders.customer.unassigned');
  }
  return trimmed;
}

export function orderStatusLabelKey(status: string): string {
  return `orders.status.${status}`;
}

/** UI filter "processing" matches backend confirmed + paid. */
export function orderMatchesStatusFilter(
  apiStatus: string,
  filter: string,
): boolean {
  if (filter === 'all') return true;
  if (filter === 'processing') {
    return apiStatus === 'confirmed' || apiStatus === 'paid';
  }
  return apiStatus === filter;
}
