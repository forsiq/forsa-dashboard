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
}

export interface PendingResponse {
  listings: PendingItem[];
  auctions: PendingItem[];
}

export const moderationService = {
  getPending: async (): Promise<PendingResponse> => {
    const client = baseClient.getInstance();
    const response = await client.get('/moderation/pending');
    return response.data.data || response.data;
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
