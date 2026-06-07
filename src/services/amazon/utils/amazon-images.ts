import type { AmazonProduct } from '../api/amazon-api';

// Mirror of backend dedup logic in auction-service/src/common/services/image-transfer.service.ts `dedupeExternalUrls()`.
// Keep regex patterns in sync: /\/images\/I\/([^._/?]+)/i and /\._[A-Z]{2,3}\d+_\./i

/** Extract stable Amazon image id (e.g. 71dK3j8eArL) for deduplication across size variants. */
export function amazonImageKey(url: string): string {
  const match = url.match(/\/images\/I\/([^._/?]+)/i);
  return match ? match[1].toLowerCase() : url;
}

/** Prefer high-resolution variant when possible. */
export function normalizeAmazonImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  return trimmed.replace(/\._[A-Z]{2,3}\d+_\./i, '._AC_SL1500_.');
}

/**
 * Collect all product image URLs from Rainforest product payload (deduped, ordered).
 */
export function collectAmazonProductImages(product: AmazonProduct): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  const add = (raw?: string | null) => {
    if (!raw || typeof raw !== 'string') return;
    const normalized = normalizeAmazonImageUrl(raw);
    if (!normalized) return;
    const key = amazonImageKey(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    urls.push(normalized);
  };

  add(product.image);
  add(product.main_image?.link);

  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (typeof img === 'string') add(img);
      else add(img?.link);
    }
  }

  if (typeof product.images_flat === 'string' && product.images_flat.trim()) {
    for (const part of product.images_flat.split(',')) {
      add(part);
    }
  }

  return urls;
}
