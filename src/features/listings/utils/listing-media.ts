import {
  filterImageUrls,
  isValidImageUrl,
  normalizeImageUrlList,
  parseAttachmentIds,
} from '@features/auctions/utils/auction-utils';

const OWN_IMAGE_HOSTS = [
  'file.zonevast.com',
  'file1.zonevast.com',
  'test.zonevast.com',
  'api.zonevast.com',
  'localhost',
];

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

/** Normalize URL for stable attachment lookup (strip query/hash). */
export function normalizeImageUrlKey(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split(/[?#]/)[0] ?? url;
  }
}

/** Build reverse map: preview URL → attachment ID. */
export function buildUrlToAttachmentIdMap(
  attachmentIds: number[],
  attachmentUrlMap: Map<number, string> | undefined,
  previewUrls?: string[],
): Map<string, number> {
  const map = new Map<string, number>();

  for (const id of attachmentIds) {
    const url = attachmentUrlMap?.get(id);
    if (url) {
      map.set(url, id);
      map.set(normalizeImageUrlKey(url), id);
    }
  }

  if (previewUrls?.length) {
    previewUrls.forEach((url, index) => {
      const id = attachmentIds[index];
      if (id && url && !map.has(url)) {
        map.set(url, id);
        map.set(normalizeImageUrlKey(url), id);
      }
    });
  }

  return map;
}

/** External import URL (Amazon, etc.) that must be transferred server-side — not fetchable from browser. */
export function isExternalImportImageUrl(url: string): boolean {
  if (!url || url.startsWith('blob:')) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const hostname = parsed.hostname;
    if (hostname.endsWith('.amazonaws.com')) return false;
    if (OWN_IMAGE_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`))) {
      return false;
    }
    return isValidImageUrl(url);
  } catch {
    return false;
  }
}

export function lookupAttachmentIdForPreviewUrl(
  url: string,
  urlToAttachmentId: Map<string, number>,
): number | undefined {
  return urlToAttachmentId.get(url) ?? urlToAttachmentId.get(normalizeImageUrlKey(url));
}

export type ResolveListingMediaSaveInput = {
  previewUrls: string[];
  pendingFiles: File[];
  urlToAttachmentId: Map<string, number>;
  uploadFile: (file: File) => Promise<number | null>;
};

export type ResolveListingMediaSaveResult = {
  attachmentIds: number[];
  /** Ordered non-blob URLs that still need server-side transfer (e.g. Amazon CDN). */
  externalUrlsForServerTransfer: string[];
  hasPendingUploads: boolean;
};

/**
 * Walk preview URLs in display order and produce attachment IDs for save.
 * Blob previews consume pendingFiles; known URLs reuse attachment IDs; external URLs defer to server transfer.
 */
export async function resolveListingMediaSave(
  input: ResolveListingMediaSaveInput,
): Promise<ResolveListingMediaSaveResult> {
  const { previewUrls, pendingFiles, urlToAttachmentId, uploadFile } = input;
  const attachmentIds: number[] = [];
  const externalUrlsForServerTransfer: string[] = [];
  let pendingFileIndex = 0;
  let hasPendingUploads = pendingFiles.length > 0;

  for (const url of previewUrls) {
    if (url.startsWith('blob:')) {
      const file = pendingFiles[pendingFileIndex++];
      if (!file) continue;
      const id = await uploadFile(file);
      if (id) attachmentIds.push(id);
      hasPendingUploads = true;
      continue;
    }

    const knownId = lookupAttachmentIdForPreviewUrl(url, urlToAttachmentId);
    if (knownId) {
      attachmentIds.push(knownId);
      continue;
    }

    if (isExternalImportImageUrl(url)) {
      externalUrlsForServerTransfer.push(url);
    }
  }

  return { attachmentIds, externalUrlsForServerTransfer, hasPendingUploads };
}

/** Reorder retained attachment IDs when the user drag-sorts existing (non-blob) previews. */
export function reorderRetainedAttachmentIds(
  newOrder: string[],
  previousPreviewUrls: string[],
  previousRetainedIds: number[],
  urlToAttachmentId: Map<string, number>,
): number[] {
  const existingCount = previousPreviewUrls.length;
  const reordered: number[] = [];

  for (const url of newOrder) {
    const oldIndex = previousPreviewUrls.indexOf(url);
    if (oldIndex < 0 || oldIndex >= existingCount) continue;

    const id =
      lookupAttachmentIdForPreviewUrl(url, urlToAttachmentId) ??
      (oldIndex < previousRetainedIds.length ? previousRetainedIds[oldIndex] : undefined);
    if (id) reordered.push(id);
  }

  return reordered;
}
