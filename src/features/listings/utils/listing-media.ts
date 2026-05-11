import { normalizeImageUrlList } from '@features/auctions/utils/auction-utils';

/** Listing payloads may use camelCase or snake_case; cover URL may live on `imageUrl` only while `images` stays empty (attachment resolver). */
export type ListingMediaLike = {
  imageUrl?: string | null;
  image_url?: string | null;
  images?: unknown;
};

export function getListingImageGalleryUrls(listing: ListingMediaLike): string[] {
  const urls: string[] = [];
  const direct = listing.imageUrl || listing.image_url;
  if (typeof direct === 'string' && direct.trim()) {
    urls.push(direct.trim());
  }
  for (const u of normalizeImageUrlList(listing.images)) {
    if (typeof u === 'string' && u.trim()) urls.push(u.trim());
  }
  return [...new Set(urls)];
}

export function getListingPrimaryImageUrl(listing: ListingMediaLike): string | null {
  const all = getListingImageGalleryUrls(listing);
  return all[0] ?? null;
}
