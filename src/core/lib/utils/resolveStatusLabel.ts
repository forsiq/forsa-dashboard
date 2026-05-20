export function normalizeStatusKey(status: string | null | undefined): string {
  return (status ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

export function isMissingTranslation(key: string, result: string): boolean {
  return !result || result === key || result.startsWith('[MISSING:');
}

/** Map localized display labels (e.g. Arabic) back to canonical English slugs. */
const STATUS_ALIASES: Record<string, string> = {
  غير_مدفوع: 'unpaid',
  غير_مدفوعة: 'unpaid',
  مدفوع: 'paid',
  مدفوعة: 'paid',
  معلق: 'pending',
  قيد_الانتظار: 'pending',
  فشل: 'failed',
  مسترد: 'refunded',
  نشط: 'active',
  منتهي: 'ended',
  ملغي: 'cancelled',
  ملغى: 'cancelled',
  مسودة: 'draft',
  مجدول: 'scheduled',
};

export function toCanonicalStatusSlug(normalized: string): string {
  if (!normalized) return normalized;
  if (/^[a-z0-9_]+$/.test(normalized)) return normalized;
  return STATUS_ALIASES[normalized] ?? normalized;
}

/** Translation key candidates for a normalized status token (first match wins). */
export function getStatusTranslationCandidates(normalized: string): string[] {
  const slug = toCanonicalStatusSlug(normalized);
  return [
    `status.${slug}`,
    `common.condition_${slug}`,
    `auction.lifecycle.${slug}`,
    `auction.status.${slug}`,
    `groupBuying.status.${slug}`,
    `orders.status.${slug}`,
    `orders.payment_status.${slug}`,
    `listing.detail.publish_status.${slug}`,
    `inventory.stock_${slug}`,
    `prod.add.condition_${slug}`,
    `category.${slug}`,
    `settlement.${slug}`,
    `customer.bid_status_${slug}`,
    `common.${slug}`,
  ];
}

export type TranslationLookup = (key: string) => string | undefined;

export function resolveStatusLabel(
  status: string | null | undefined,
  t: (key: string) => string,
  explicitKey?: string,
  lookup?: TranslationLookup,
): string {
  const safeStatus = String(status ?? '');

  const resolve = (key: string): string | undefined => {
    if (lookup) {
      const hit = lookup(key);
      return hit !== undefined && !isMissingTranslation(key, hit) ? hit : undefined;
    }
    const translated = t(key);
    return isMissingTranslation(key, translated) ? undefined : translated;
  };

  if (explicitKey) {
    const explicit = resolve(explicitKey);
    if (explicit) return explicit;
  }

  const normalized = normalizeStatusKey(safeStatus);
  if (!normalized) return safeStatus.trim() || '—';

  for (const key of getStatusTranslationCandidates(normalized)) {
    const translated = resolve(key);
    if (translated) return translated;
  }

  return safeStatus.trim() || normalized;
}
