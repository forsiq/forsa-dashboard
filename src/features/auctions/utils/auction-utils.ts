/**
 * Auction Utility Functions
 *
 * Uses presigned URL flow for file uploads:
 *   1. POST presigned-url/ → get S3 upload URL + fields + attachment_id
 *   2. POST to S3 with fields + file → upload directly (no CORS issues)
 *   3. POST confirm-upload/ → confirm and get final file_url
 *
 * The project-service endpoints are at /api/v1/project/attachment/...
 * (NOT under /forsa/ prefix - that's only for GraphQL services)
 */

import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.zonevast.com/forsa/api/v1';

function getApiOrigin(): string {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return 'https://test.zonevast.com';
  }
}

const API_ORIGIN = getApiOrigin();

/**
 * Project service base URL for attachment operations.
 * The project service is mounted at root /api/v1 (not under /forsa/).
 */
const PROJECT_API_URL = `${API_ORIGIN}/api/v1`;

function getProjectId(): string {
  try {
    const stored = localStorage.getItem('zv_project');
    if (stored) {
      const project = JSON.parse(stored);
      return String(project.id || '11');
    }
  } catch {}
  return '11';
}

function getAuthHeaders(): Record<string, string> {
  const token = Cookies.get('access') || localStorage.getItem('access_token');
  const projectId = getProjectId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Project-ID': projectId,
    'X-Project': projectId,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
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
 * Step 1: Request presigned URL from project-service (via gateway)
 * Step 2: Upload file directly to S3 (no CORS issues, no size limits)
 * Step 3: Confirm upload with project-service
 */
export async function uploadAttachmentAndGetId(
  file: File,
  onProgress?: (progress: number) => void
): Promise<number> {
  const headers = getAuthHeaders();

  // ---------------------------------------------------------------
  // Step 1: Request presigned URL
  // ---------------------------------------------------------------
  const presignedUrl = `${PROJECT_API_URL}/project/attachment/presigned-url/`;

  let presignedData: {
    attachment_id: number;
    upload_url: string;
    fields?: Record<string, string>;
    s3_key?: string;
  };

  try {
    const presignedResponse = await axios.post(presignedUrl, {
      file_name: file.name,
      file_size: file.size,
      content_type: file.type || 'application/octet-stream',
    }, { headers });

    const payload = presignedResponse.data;
    presignedData = payload?.data ?? payload;
  } catch (err: any) {
    const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Unknown error';
    throw new Error(`Presigned URL request failed: ${msg}`);
  }

  if (!presignedData?.attachment_id) {
    throw new Error('No attachment_id returned from presigned URL endpoint');
  }

  onProgress?.(10);

  // ---------------------------------------------------------------
  // Step 2: Upload to S3
  // ---------------------------------------------------------------
  const { upload_url, fields } = presignedData;

  try {
    if (fields && Object.keys(fields).length > 0) {
      // S3 presigned POST: fields first, file last
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
      // Direct PUT upload
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
  const confirmUrl = `${PROJECT_API_URL}/project/attachment/confirm-upload/`;

  try {
    await axios.post(confirmUrl, {
      attachment_id: presignedData.attachment_id,
    }, { headers });
  } catch (err: any) {
    const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Unknown error';
    throw new Error(`Upload confirmation failed: ${msg}`);
  }

  onProgress?.(100);
  return presignedData.attachment_id;
}
