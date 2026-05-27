import { createApiClient } from '@core/services/ApiClientFactory';
import { API_BASE_URL } from '@config/api';

const baseClient = createApiClient({
  serviceName: 'moderation',
  endpoint: '/moderation',
  apiBaseUrl: API_BASE_URL,
});

export interface PendingItem {
  id: number;
  title: string;
  merchantName: string;
  merchantId: string;
  submittedAt: string;
  category: string;
  imageUrl?: string | null;
  status: string;
  readinessScore?: number | null;
  readinessWarnings?: number | null;
}

export interface PendingResponse {
  listings: PendingItem[];
  auctions: PendingItem[];
}

function mapPendingItem(raw: Record<string, unknown>): PendingItem {
  return {
    id: Number(raw.id),
    title: String(raw.title ?? ''),
    merchantName: String(raw.merchantName ?? raw.sellerName ?? '—'),
    merchantId: String(raw.sellerId ?? raw.merchantId ?? ''),
    submittedAt: String(raw.submittedAt ?? raw.createdAt ?? new Date().toISOString()),
    category: String(raw.categoryName ?? '—'),
    imageUrl: (raw.imageUrl as string | null | undefined) ?? null,
    status: String(raw.approvalStatus ?? raw.status ?? 'unknown'),
    readinessScore: raw.readinessScore != null ? Number(raw.readinessScore) : null,
    readinessWarnings: raw.readinessWarnings != null ? Number(raw.readinessWarnings) : null,
  };
}

function filterPendingReview(items: PendingItem[]): PendingItem[] {
  return items.filter((item) => item.status === 'pending_review');
}

export const moderationService = {
  getPending: async (): Promise<PendingResponse> => {
    const client = baseClient.getInstance();
    const response = await client.get('/moderation/pending');
    const payload = response.data.data || response.data;
    const listings = filterPendingReview(
      (payload.listings ?? []).map((item: Record<string, unknown>) => mapPendingItem(item)),
    );
    const auctions = filterPendingReview(
      (payload.auctions ?? []).map((item: Record<string, unknown>) => mapPendingItem(item)),
    );
    return { listings, auctions };
  },

  approveListing: async (id: number | string): Promise<void> => {
    const client = baseClient.getInstance();
    await client.post(`/moderation/listing/${id}/approve`);
  },

  rejectListing: async (id: number | string, reason: string): Promise<void> => {
    const client = baseClient.getInstance();
    await client.post(`/moderation/listing/${id}/reject`, { reason });
  },

  requestChangesListing: async (id: number | string, reason: string): Promise<void> => {
    const client = baseClient.getInstance();
    await client.post(`/moderation/listing/${id}/request-changes`, { reason });
  },

  approveAuction: async (id: number | string): Promise<void> => {
    const client = baseClient.getInstance();
    await client.post(`/moderation/auction/${id}/approve`);
  },

  rejectAuction: async (id: number | string, reason: string): Promise<void> => {
    const client = baseClient.getInstance();
    await client.post(`/moderation/auction/${id}/reject`, { reason });
  },

  requestChangesAuction: async (id: number | string, reason: string): Promise<void> => {
    const client = baseClient.getInstance();
    await client.post(`/moderation/auction/${id}/request-changes`, { reason });
  },
};
