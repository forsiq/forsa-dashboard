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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.zonevast.com/forsa/api/v1';

function getApiOrigin(): string {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
}

const API_ORIGIN = getApiOrigin();

/**
 * Project service base URL for attachment operations.
 * The project service is mounted at root /api/v1 (not under /forsa/).
 */
const PROJECT_API_URL = `${API_ORIGIN}/api/v1`;

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
export function parseAttachmentIds(attachmentIds: string | string[] | null | undefined): number[] {
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
 * Get image URL for an auction
 */
export function getAuctionImageUrl(auction: {
  imageUrl?: string | null;
  mainAttachmentId?: number | null;
  attachmentIds?: string | string[] | null;
  images?: string[] | null;
}): string | null {
  if (auction.imageUrl) {
    return auction.imageUrl;
  }

  if (auction.images && auction.images.length > 0) {
    return auction.images[0];
  }

  const mainId = auction.mainAttachmentId;
  const ids = parseAttachmentIds(auction.attachmentIds);
  const attachmentId = mainId || (ids.length > 0 ? ids[0] : null);

  if (!attachmentId) {
    return null;
  }

  return `${API_ORIGIN}/api/v1/project/attachment/${attachmentId}/download/`;
}

/**
 * Get all image URLs for an auction
 */
export function getAuctionImageUrls(auction: {
  imageUrl?: string | null;
  mainAttachmentId?: number | null;
  attachmentIds?: string | string[] | null;
  images?: string[] | null;
}): string[] {
  const urls: string[] = [];

  if (auction.imageUrl) {
    urls.push(auction.imageUrl);
  }

  if (auction.images && auction.images.length > 0) {
    urls.push(...auction.images);
  }

  const ids = parseAttachmentIds(auction.attachmentIds);
  ids.forEach(id => {
    urls.push(`${API_ORIGIN}/api/v1/project/attachment/${id}/download/`);
  });

  return [...new Set(urls)];
}

/**
 * Fetch attachment URL for use in <img> tags
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
