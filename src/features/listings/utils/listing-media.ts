import {
  filterImageUrls,
  normalizeImageUrlList,
  parseAttachmentIds,
} from '@features/auctions/utils/auction-utils';

/** Listing payloads may use camelCase or snake_case; cover URL may live on `imageUrl` only while `images` stays empty (attachment resolver). */
export type ListingMediaLike = {
  imageUrl?: string | null;
  image_url?: string | null;
  images?: unknown;
  mainAttachmentId?: number | null;
  main_attachment_id?: number | null;
  attachmentIds?: string | string[] | number[] | null;
  attachment_ids?: string | string[] | number[] | null;
};

export function getListingImageGalleryUrls(listing: ListingMediaLike): string[] {
  const urls: string[] = [];
  const direct = listing.imageUrl || listing.image_url;
  if (typeof direct === 'string' && direct.trim()) {
    urls.push(...filterImageUrls([direct.trim()]));
  }
  urls.push(...filterImageUrls(normalizeImageUrlList(listing.images)));
  return [...new Set(urls)];
}

export function getListingPrimaryImageUrl(listing: ListingMediaLike): string | null {
  const all = getListingImageGalleryUrls(listing);
  return all[0] ?? null;
}

/**
 * Merge direct image URLs with attachment-resolved URLs (deduped, attachment order first).
 */
export function mergeListingGalleryUrls(
  directUrls: string[],
  attachmentIds: number[],
  attachmentUrlMap: Map<number, string> | undefined,
): string[] {
  const fromAttachments = attachmentIds
    .map((id) => attachmentUrlMap?.get(id))
    .filter((url): url is string => typeof url === 'string' && url.length > 0);

  const seen = new Set<string>();
  const merged: string[] = [];

  const push = (url: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    merged.push(url);
  };

  for (const url of fromAttachments) push(url);
  for (const url of directUrls) push(url);

  return merged;
}

/** Attachment IDs for use with useAttachmentUrls (main ID first, deduped). */
export function getListingAttachmentIds(listing: ListingMediaLike): number[] {
  const raw = listing as ListingMediaLike & {
    attachment_ids?: string | string[] | number[] | null;
    main_attachment_id?: number | null;
  };
  const ids = parseAttachmentIds(raw.attachmentIds ?? raw.attachment_ids);
  const mainId = raw.mainAttachmentId ?? raw.main_attachment_id ?? null;

  if (mainId) {
    const rest = ids.filter((id) => id !== mainId);
    return [mainId, ...rest];
  }

  return ids;
}
