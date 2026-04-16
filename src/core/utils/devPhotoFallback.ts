/**
 * Client-side placeholders when API payloads have no usable image.
 * Mutates responses in memory only (does not POST new records).
 *
 * Which app features need this: see `featurePhotoSurfaces.ts` (`FEATURES_THAT_SURFACE_IMAGES`).
 */

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80',
  'https://images.unsplash.com/photo-1585386959980-a4155224a120?w=800&q=80',
  'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
] as const;

export function pickDevPlaceholderImage(seed: number): string {
  const idx = Math.abs(Math.floor(seed)) % PLACEHOLDER_IMAGES.length;
  return PLACEHOLDER_IMAGES[idx]!;
}

export function isLikelyHttpImageUrl(value: unknown): boolean {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

function parseAttachmentIdsField(attachmentIds: unknown): number[] {
  if (!attachmentIds) return [];
  if (Array.isArray(attachmentIds)) {
    return attachmentIds
      .map((id) => (typeof id === 'string' ? parseInt(id, 10) : Number(id)))
      .filter((n) => !Number.isNaN(n) && n > 0);
  }
  if (typeof attachmentIds !== 'string') return [];
  try {
    const parsed = JSON.parse(attachmentIds);
    return Array.isArray(parsed)
      ? parsed.map((id: unknown) => parseInt(String(id), 10)).filter((n) => !Number.isNaN(n) && n > 0)
      : [];
  } catch {
    return [];
  }
}

function imagesArrayHasUrl(images: unknown): boolean {
  if (!Array.isArray(images)) return false;
  return images.some((u) => isLikelyHttpImageUrl(u));
}

/**
 * True if the auction payload already has a direct URL, attachment id(s), or usable images[].
 */
export function auctionRecordHasPhoto(auction: Record<string, unknown>): boolean {
  if (isLikelyHttpImageUrl(auction.imageUrl) || isLikelyHttpImageUrl(auction.image_url)) return true;
  const main =
    auction.mainAttachmentId ?? auction.main_attachment_id ?? auction.mainAttachmentID ?? auction.main_attachmentID;
  if (typeof main === 'number' && main > 0) return true;
  if (typeof main === 'string' && /^\d+$/.test(main.trim())) return true;

  const ids = parseAttachmentIdsField(auction.attachmentIds ?? auction.attachment_ids);
  if (ids.length > 0) return true;

  if (imagesArrayHasUrl(auction.images)) return true;

  return false;
}

/** Returns a shallow clone with `images` set to a single placeholder URL when no photo exists. */
export function withAuctionPhotoFallback<T extends Record<string, unknown>>(auction: T): T {
  if (auctionRecordHasPhoto(auction)) {
    return auction;
  }
  const id = Number(auction.id) || 0;
  const url = pickDevPlaceholderImage(id);
  return { ...auction, images: [url] } as T;
}

function productRawHasPhoto(p: Record<string, unknown>): boolean {
  if (isLikelyHttpImageUrl(p.image) || isLikelyHttpImageUrl(p.image_url) || isLikelyHttpImageUrl(p.imageUrl)) {
    return true;
  }
  if (imagesArrayHasUrl(p.images)) return true;
  return false;
}

/**
 * Pick image string for items/products mapping — only replaces missing or non-URL placeholders (e.g. emoji).
 */
export function resolveItemDisplayImage(p: Record<string, unknown>, mappedImage: string): string {
  if (isLikelyHttpImageUrl(mappedImage)) return mappedImage;
  if (productRawHasPhoto(p)) {
    const fromImages = Array.isArray(p.images) ? p.images.find((u) => isLikelyHttpImageUrl(u)) : undefined;
    if (typeof fromImages === 'string') return fromImages;
    if (isLikelyHttpImageUrl(p.image_url)) return String(p.image_url);
    if (isLikelyHttpImageUrl(p.imageUrl)) return String(p.imageUrl);
  }
  const seed = Number(p.idnum ?? p.id) || String(p.slug ?? p.title ?? '').length;
  return pickDevPlaceholderImage(seed);
}

export function inventoryRecordHasPhoto(p: Record<string, unknown>): boolean {
  if (isLikelyHttpImageUrl(p.image_url) || isLikelyHttpImageUrl(p.imageUrl)) return true;
  if (imagesArrayHasUrl(p.images)) return true;
  return false;
}

/**
 * Inventory REST row: fills `images` (and `image_url` for UIs that read snake_case) when empty.
 */
export function withInventoryProductPhotoFallback<T extends Record<string, unknown>>(p: T): T {
  if (inventoryRecordHasPhoto(p)) return p;
  const seed = Number(p.id) || String(p.sku ?? p.name ?? '').length;
  const url = pickDevPlaceholderImage(seed);
  return { ...p, images: [url], image_url: url } as T;
}

export function withGroupBuyingPhotoFallback<T extends Record<string, unknown>>(campaign: T): T {
  const item = campaign.item as Record<string, unknown> | undefined;
  const topImages = (campaign as { images?: unknown }).images;
  const nestedImages = item?.images;

  if (imagesArrayHasUrl(nestedImages) || imagesArrayHasUrl(topImages)) {
    return campaign;
  }

  const url = pickDevPlaceholderImage(Number(campaign.id) || 0);

  if (item && typeof item === 'object') {
    return {
      ...campaign,
      item: { ...item, images: [url] },
    } as T;
  }

  return { ...campaign, images: [url] } as T;
}
