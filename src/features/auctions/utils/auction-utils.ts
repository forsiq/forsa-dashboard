/**
 * Auction Utility Functions
 */

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://test.zonevast.com';

function getProjectHeaders() {
  if (typeof window === 'undefined') return { 'X-Project-ID': '11' };
  try {
    return {
      'X-Project-ID': localStorage.getItem('project_id') || '11',
    };
  } catch (e) {
    return { 'X-Project-ID': '11' };
  }
}

/**
 * Parse attachment IDs from the string format returned by API
 * The API returns attachmentIds as a string like "[131, 132, 130]"
 */
export function parseAttachmentIds(attachmentIds: string | string[] | null | undefined): number[] {
  if (!attachmentIds) return [];

  if (Array.isArray(attachmentIds)) {
    return attachmentIds.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
  }

  // Parse string format "[131, 132, 130]"
  try {
    const parsed = JSON.parse(attachmentIds);
    return Array.isArray(parsed) ? parsed.map((id: any) => parseInt(id, 10)) : [];
  } catch {
    return [];
  }
}

/**
 * Get image URL for an auction
 * Uses mainAttachmentId or falls back to first attachmentId
 *
 * IMPORTANT: Uses the /download/ endpoint which proxies files with proper authentication
 */
export function getAuctionImageUrl(auction: {
  imageUrl?: string | null;
  mainAttachmentId?: number | null;
  attachmentIds?: string | string[] | null;
  images?: string[] | null;
}): string | null {
  // If imageUrl is already set, use it
  if (auction.imageUrl) {
    return auction.imageUrl;
  }

  // Check images array
  if (auction.images && auction.images.length > 0) {
    return auction.images[0];
  }

  // Use mainAttachmentId or first from attachmentIds
  const mainId = auction.mainAttachmentId;
  const ids = parseAttachmentIds(auction.attachmentIds);
  const attachmentId = mainId || (ids.length > 0 ? ids[0] : null);

  if (!attachmentId) {
    return null;
  }

  // Use the download endpoint - this proxies the file with authentication
  return `${API_BASE_URL}/api/v1/project/attachment/${attachmentId}/download/`;
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

  // Add imageUrl if available
  if (auction.imageUrl) {
    urls.push(auction.imageUrl);
  }

  // Add images from array
  if (auction.images && auction.images.length > 0) {
    urls.push(...auction.images);
  }

  // Add attachment URLs using download endpoint
  const ids = parseAttachmentIds(auction.attachmentIds);
  ids.forEach(id => {
    urls.push(`${API_BASE_URL}/api/v1/project/attachment/${id}/download/`);
  });

  return [...new Set(urls)]; // Remove duplicates
}

/**
 * Fetch attachment URL for use in <img> tags
 *
 * IMPORTANT: Returns the download endpoint URL which proxies the file
 * with proper authentication. Direct file.zonevast.com URLs return 403.
 *
 * @param attachmentId Database ID of the attachment
 * @returns Authenticated download URL that works in <img> tags
 */
export async function fetchAttachmentUrl(attachmentId: number): Promise<string | null> {
  // Return the download endpoint directly - it handles authentication
  // No need to fetch attachment metadata first
  return `${API_BASE_URL}/api/v1/project/attachment/${attachmentId}/download/`;
}

/**
 * Upload a file to the project attachment service and return attachment id
 * Tries common upload endpoints used across environments.
 */
export async function uploadAttachmentAndGetId(file: File): Promise<number | null> {
  const endpoints = [
    `${API_BASE_URL}/en/api/v1/project/attachment/upload/`,
    `${API_BASE_URL}/api/v1/project/attachment/upload/`,
    `${API_BASE_URL}/en/api/v1/project/attachment/`,
    `${API_BASE_URL}/api/v1/project/attachment/`,
  ];

  for (const url of endpoints) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(url, {
        method: 'POST',
        headers: getProjectHeaders(),
        body: formData,
      });

      if (!response.ok) continue;
      const payload = await response.json();
      const id =
        payload?.data?.id ??
        payload?.data?.attachment_id ??
        payload?.id ??
        payload?.attachment_id;
      if (typeof id === 'number') return id;
      if (typeof id === 'string' && id.trim()) return Number(id);
    } catch {
      // Try next known endpoint
    }
  }

  return null;
}
