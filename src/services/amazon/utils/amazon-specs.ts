import type { AmazonProduct } from '../api/amazon-api';
import type { ListingSpec } from '../../../types/services/listings.types';

export interface NormalizedSpec {
  label: string;
  value: string;
}

/**
 * Normalize Amazon/Rainforest product specifications into label/value pairs.
 *
 * Rainforest returns `specifications` as an array of `{ name, value }` objects,
 * but some payloads (and older typings) use a `Record<string, { value } | string>`.
 * This helper accepts both shapes and drops empty rows.
 */
export function normalizeAmazonSpecs(
  specs: AmazonProduct['specifications'],
): NormalizedSpec[] {
  if (!specs) return [];

  const pairs: NormalizedSpec[] = [];

  if (Array.isArray(specs)) {
    for (const entry of specs) {
      if (!entry || typeof entry !== 'object') continue;
      const label = String((entry as { name?: unknown }).name ?? '').trim();
      const value = String((entry as { value?: unknown }).value ?? '').trim();
      if (label || value) pairs.push({ label, value });
    }
    return pairs;
  }

  if (typeof specs === 'object') {
    for (const [key, value] of Object.entries(specs)) {
      const label = String(key ?? '').trim();
      const valueStr =
        typeof value === 'object' && value !== null
          ? String((value as { value?: unknown }).value ?? '').trim()
          : String(value ?? '').trim();
      if (label || valueStr) pairs.push({ label, value: valueStr });
    }
  }

  return pairs;
}

/** Convenience: listing-ready specs, empty rows removed. */
export function collectAmazonListingSpecs(product: AmazonProduct): ListingSpec[] {
  return normalizeAmazonSpecs(product.specifications);
}
