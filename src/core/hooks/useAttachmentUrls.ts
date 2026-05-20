import { useQuery } from '@tanstack/react-query';
import { createClient } from '@core/services/ApiClientFactory';

import { API_BASE_URL, getApiOrigin } from '@config/api';

/* getApiOrigin imported from @config/api */

const PROJECT_API_URL = `${getApiOrigin()}/api/v1`;

const sharedClient = createClient(PROJECT_API_URL);

const CLOUDFRONT_FILES_DOMAIN = 'file.zonevast.com';

function normalizeResolvedFileUrl(fileUrl: string): string {
  try {
    const parsed = new URL(fileUrl);
    if (parsed.hostname === CLOUDFRONT_FILES_DOMAIN) return fileUrl;
    const host = parsed.hostname;
    if (!host.includes('amazonaws.com') && !host.includes('.s3.')) return fileUrl;

    let key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
    const pathSegments = key.split('/');
    if (pathSegments.length > 1) {
      const first = pathSegments[0];
      if (first === 'file-zonevast-eu' || first === 'file.zonevast.com' || first === 'file1.zonevast.com') {
        key = pathSegments.slice(1).join('/');
      }
    }
    return key ? `https://${CLOUDFRONT_FILES_DOMAIN}/${key}` : fileUrl;
  } catch {
    return fileUrl;
  }
}

export interface BatchAttachmentResult {
  id: number;
  file_url: string | null;
  type: string;
  upload_status: string;
}

const attachmentKeys = {
  batch: (ids: number[]) => ['attachments', 'batch', ids] as const,
};

async function fetchIndividualAttachmentUrl(id: number): Promise<BatchAttachmentResult | null> {
  try {
    const response = await sharedClient.get(`/project/attachment/${id}/`);
    return response.data?.data || response.data || null;
  } catch {
    return null;
  }
}

async function fetchAttachmentUrlsWithFallback(ids: number[]): Promise<Map<number, string | null>> {
  const urlMap = new Map<number, string | null>();

  if (ids.length === 0) return urlMap;

  // Try batch endpoint first
  try {
    const response = await sharedClient.post('/project/attachment/batch/', {
      attachment_ids: ids,
    });

    const results = response.data?.results || response.data?.data?.results || {};

    for (const id of ids) {
      const item: BatchAttachmentResult | undefined = results[String(id)];
      if (item?.file_url) {
        urlMap.set(id, normalizeResolvedFileUrl(item.file_url));
      } else {
        urlMap.set(id, null);
      }
    }
    return urlMap;
  } catch {
    // Batch endpoint failed — fall back to individual fetches
  }

  // Fallback: fetch attachments individually (up to 10 concurrent)
  const batchSize = 10;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const results = await Promise.all(batch.map((id) => fetchIndividualAttachmentUrl(id)));

    for (let j = 0; j < batch.length; j++) {
      const item = results[j];
      if (item?.file_url) {
        urlMap.set(batch[j], normalizeResolvedFileUrl(item.file_url));
      } else {
        urlMap.set(batch[j], null);
      }
    }
  }

  return urlMap;
}

export function useAttachmentUrls(ids: number[]) {
  const uniqueIds = ids.filter((id, index, arr) => id > 0 && arr.indexOf(id) === index);
  const sortedKey = [...uniqueIds].sort((a, b) => a - b);

  return useQuery({
    queryKey: attachmentKeys.batch(sortedKey),
    queryFn: () => fetchAttachmentUrlsWithFallback(sortedKey),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: sortedKey.length > 0,
  });
}

export { normalizeResolvedFileUrl, sharedClient as attachmentApiClient };
