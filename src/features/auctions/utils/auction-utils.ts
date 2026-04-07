/**
 * Auction Utility Functions
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://test.zonevast.com';

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

  // Build attachment URL
  return `${API_BASE_URL}/api/v1/project/attachments/${attachmentId}/`;
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

  // Add attachment URLs
  const ids = parseAttachmentIds(auction.attachmentIds);
  ids.forEach(id => {
    urls.push(`${API_BASE_URL}/api/v1/project/attachments/${id}/`);
  });

  return [...new Set(urls)]; // Remove duplicates
}

/**
 * Fetch attachment details to get the actual file URL
 * This makes an API call to get the file_url field
 */
export async function fetchAttachmentUrl(attachmentId: number): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/project/attachments/${attachmentId}/`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Project-ID': '11',
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.file_url || null;
  } catch {
    return null;
  }
}
