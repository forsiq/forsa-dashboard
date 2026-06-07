import { filterImageUrls } from '@features/auctions/utils/auction-utils';
import type { ListingMediaLike } from './listing-media';
import {
  getListingAttachmentIds,
  getListingImageGalleryUrls,
  mergeListingGalleryUrls,
} from './listing-media';

function collectImportFallbackUrls(listing: ListingMediaLike): string[] {
  const meta = listing.metadata;
  if (!meta || typeof meta !== 'object') return [];

  const fromMeta = meta.originalImageUrls ?? meta.original_image_urls;
  if (Array.isArray(fromMeta)) {
    return filterImageUrls(fromMeta);
  }
  return [];
}

/**
 * Full gallery for listing detail / wizard preview: attachment-resolved URLs,
 * direct API URLs, then Amazon-import metadata fallbacks when still incomplete.
 */
export function buildListingGalleryImages(
  listing: ListingMediaLike,
  attachmentUrlMap: Map<number, string> | undefined,
): string[] {
  const directUrls = getListingImageGalleryUrls(listing);
  const attachmentIds = getListingAttachmentIds(listing);
  const merged = mergeListingGalleryUrls(directUrls, attachmentIds, attachmentUrlMap);

  const metaFallback = filterImageUrls(collectImportFallbackUrls(listing));
  if (merged.length === 0 && metaFallback.length > 0) {
    return metaFallback;
  }

  if (attachmentIds.length > merged.length && metaFallback.length > 0) {
    const seen = new Set(merged);
    for (const url of metaFallback) {
      if (!seen.has(url)) {
        merged.push(url);
        seen.add(url);
      }
    }
  }

  return merged;
}
