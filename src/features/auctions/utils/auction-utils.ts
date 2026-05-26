/**
 * Auction Utility Functions
 *
 * Uses presigned URL flow for file uploads:
 *   1. Calculate SHA-256 hash (for content-addressable dedup)
 *   2. POST presigned-url/ → get S3 upload URL + fields + attachment_id
 *      - If hash matches an existing file → returns immediately (no upload needed)
 *   3. POST to S3 with fields + file → upload directly (CORS configured)
 *   4. POST confirm-upload/ → confirm and get final file_url
 *
 * Uses createClient from ApiClientFactory which has token refresh interceptors.
 */

import axios from 'axios';
import { createClient } from '@core/services/ApiClientFactory';

import { getApiOrigin } from '@config/api';
import { getProjectServiceBaseUrl } from '../../../lib/api-config';

const ALLOWED_IMAGE_HOSTNAMES = [
  'file.zonevast.com',
  'file1.zonevast.com',
  'test.zonevast.com',
  'api.zonevast.com',
  'localhost',
];

function isAllowedImageHostname(hostname: string): boolean {
  if (ALLOWED_IMAGE_HOSTNAMES.includes(hostname)) return true;
  if (hostname.endsWith('.amazonaws.com')) return true;
  if (hostname.endsWith('.cloudfront.net')) return true;
  return false;
}

export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    return isAllowedImageHostname(parsed.hostname);
  } catch {
    return false;
  }
}

/** Coerce API `images` field (array | JSON string | record | null) into a flat list of candidates. */
export function normalizeImageUrlList(images: unknown): (string | null | undefined)[] {
  if (images == null) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === 'string') {
    const s = images.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s) as unknown;
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'string') return [parsed];
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return Object.values(parsed as Record<string, unknown>).filter(
          (v): v is string => typeof v === 'string',
        );
      }
    } catch {
      return [images];
    }
    return [images];
  }
  if (typeof images === 'object') {
    return Object.values(images as Record<string, unknown>).filter(
      (v): v is string => typeof v === 'string',
    );
  }
  return [];
}

export function filterImageUrls(urls: unknown): string[] {
  const list = normalizeImageUrlList(urls);
  return list.filter((u): u is string => typeof u === 'string' && isValidImageUrl(u));
}

/* getApiOrigin imported from @config/api */

const API_ORIGIN = getApiOrigin();
const PROJECT_API_URL = getProjectServiceBaseUrl();

/**
 * Get an axios instance with auth interceptors (token refresh on 401).
 * Uses createClient from ApiClientFactory which handles refresh automatically.
 */
function getAuthedClient() {
  return createClient(PROJECT_API_URL);
}

/**
 * Calculate SHA-256 hash of a File using the Web Crypto API.
 * This runs in a Web Worker-friendly way (no blocking).
 */
export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Parse attachment IDs from the string format returned by API
 */
export function parseAttachmentIds(
  attachmentIds: string | string[] | number[] | null | undefined,
): number[] {
  if (!attachmentIds) return [];

  if (Array.isArray(attachmentIds)) {
    return attachmentIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
  }

  try {
    const parsed = JSON.parse(attachmentIds);
    return Array.isArray(parsed) ? parsed.map((id: any) => parseInt(id, 10)) : [];
  } catch {
    return [];
  }
}

/**
 * Get image URL for an auction.
 * Returns direct imageUrl if available (already a CloudFront URL).
 * Returns null when only attachment IDs exist — callers should use useAttachmentUrls
 * to resolve IDs to CloudFront URLs via the batch endpoint.
 */
export function getAuctionImageUrl(auction: {
  imageUrl?: string | null;
  mainAttachmentId?: number | null;
  attachmentIds?: string | string[] | number[] | null;
  images?: string[] | Record<string, string> | string | null;
}): string | null {
  if (auction.imageUrl && isValidImageUrl(auction.imageUrl)) {
    return auction.imageUrl;
  }

  const imageCandidates = normalizeImageUrlList(auction.images);
  if (imageCandidates.length > 0) {
    const valid = filterImageUrls(imageCandidates);
    if (valid.length > 0) return valid[0];
  }

  // Attachment IDs need async resolution via useAttachmentUrls — return null.
  return null;
}

/**
 * Get all image URLs for an auction.
 * Returns direct imageUrls (already CloudFront URLs) if available.
 * Returns empty array when only attachment IDs exist — callers should use useAttachmentUrls
 * to resolve IDs to CloudFront URLs via the batch endpoint.
 */
export function getAuctionImageUrls(auction: {
  imageUrl?: string | null;
  mainAttachmentId?: number | null;
  attachmentIds?: string | string[] | number[] | null;
  images?: string[] | Record<string, string> | string | null;
}): string[] {
  const urls: string[] = [];

  if (auction.imageUrl && isValidImageUrl(auction.imageUrl)) {
    urls.push(auction.imageUrl);
  }

  const imageCandidates = normalizeImageUrlList(auction.images);
  if (imageCandidates.length > 0) {
    urls.push(...filterImageUrls(imageCandidates));
  }

  // Attachment IDs are resolved asynchronously by useAttachmentUrls — don't
  // build /download/ proxy URLs here.

  return [...new Set(urls)];
}

/**
 * Extract attachment IDs from an auction for use with useAttachmentUrls.
 * Returns the IDs that need async resolution to CloudFront URLs.
 */
export function getAuctionAttachmentIds(auction: {
  mainAttachmentId?: number | null;
  attachmentIds?: string | string[] | number[] | null;
}): number[] {
  const ids = parseAttachmentIds(auction.attachmentIds);
  const mainId = auction.mainAttachmentId;

  if (mainId) {
    // Put main first, then the rest (deduplicated)
    const rest = ids.filter(id => id !== mainId);
    return [mainId, ...rest];
  }

  return ids;
}

/**
 * Fetch attachment URL for use in <img> tags.
 * DEPRECATED: Use useAttachmentUrls hook instead for batch resolution
 * via CloudFront. This function returns a /download/ proxy URL as fallback.
 */
export async function fetchAttachmentUrl(attachmentId: number): Promise<string | null> {
  return `${API_ORIGIN}/api/v1/project/attachment/${attachmentId}/download/`;
}

/**
 * Upload a file using the presigned URL flow (3-step process).
 *
 * Uses createClient from ApiClientFactory which automatically handles
 * token refresh on 401 - so expired tokens are refreshed transparently.
 *
 * Content-addressable deduplication:
 *   - Calculates SHA-256 hash before requesting presigned URL
 *   - If server finds an existing attachment with the same hash for the same project,
 *     returns the existing attachment_id immediately (no upload to S3 needed)
 *
 * Step 1: Request presigned URL (with file_hash for dedup check)
 * Step 2: Upload file directly to S3 (only if new file)
 * Step 3: Confirm upload with project-service (only if new file)
 */
export async function uploadAttachmentAndGetId(
  file: File,
  onProgress?: (progress: number) => void
): Promise<number> {
  const client = getAuthedClient();

  // ---------------------------------------------------------------
  // Step 0: Calculate SHA-256 hash for content-addressable dedup
  // ---------------------------------------------------------------
  onProgress?.(2);
  const fileHash = await calculateFileHash(file);
  onProgress?.(5);

  // ---------------------------------------------------------------
  // Step 1: Request presigned URL (with hash)
  // ---------------------------------------------------------------
  let presignedData: {
    attachment_id: number;
    upload_url: string | null;
    fields?: Record<string, string> | null;
    s3_key?: string;
    already_exists?: boolean;
    file_url?: string;
  };

  try {
    const presignedResponse = await client.post('/project/attachment/presigned-url/', {
      file_name: file.name,
      file_size: file.size,
      content_type: file.type || 'application/octet-stream',
      file_hash: fileHash,
    });

    const payload = presignedResponse.data;
    presignedData = payload?.data ?? payload;
  } catch (err: any) {
    const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Unknown error';
    throw new Error(`Presigned URL request failed: ${msg}`);
  }

  if (!presignedData?.attachment_id) {
    throw new Error('No attachment_id returned from presigned URL endpoint');
  }

  // ---------------------------------------------------------------
  // Fast path: File already exists → return immediately
  // ---------------------------------------------------------------
  if (presignedData.already_exists) {
    onProgress?.(100);
    return presignedData.attachment_id;
  }

  onProgress?.(10);

  // ---------------------------------------------------------------
  // Step 2: Upload to S3 (raw axios - no auth needed, S3 handles CORS)
  // ---------------------------------------------------------------
  const { upload_url, fields } = presignedData;

  if (!upload_url) {
    throw new Error('No upload_url returned for new file');
  }

  try {
    if (fields && Object.keys(fields).length > 0) {
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      await axios.post(upload_url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded / progressEvent.total) * 80) + 10;
            onProgress?.(pct);
          }
        },
        timeout: 300000,
      });
    } else {
      await axios.put(upload_url, file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const pct = Math.round((progressEvent.loaded / progressEvent.total) * 80) + 10;
            onProgress?.(pct);
          }
        },
        timeout: 300000,
      });
    }
  } catch (err: any) {
    const msg = err?.response?.data?.detail || err?.message || 'Unknown error';
    throw new Error(`S3 upload failed: ${msg}`);
  }

  onProgress?.(95);

  // ---------------------------------------------------------------
  // Step 3: Confirm upload
  // ---------------------------------------------------------------
  try {
    await client.post('/project/attachment/confirm-upload/', {
      attachment_id: presignedData.attachment_id,
      file_hash: fileHash,
    });
  } catch (err: any) {
    const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Unknown error';
    throw new Error(`Upload confirmation failed: ${msg}`);
  }

  onProgress?.(100);
  return presignedData.attachment_id;
}
