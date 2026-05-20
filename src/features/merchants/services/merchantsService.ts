import { createApiClient } from '@core/services/ApiClientFactory';
import { getWithListFilters } from '@core/services/serviceListFetch';
import { API_BASE_URL } from '@config/api';

const baseClient = createApiClient({
  serviceName: 'merchants',
  endpoint: '/merchants',
  apiBaseUrl: API_BASE_URL,
});

export interface Merchant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'active' | 'inactive' | 'suspended';
  productsCount: number;
  auctionsCount: number;
  joinedAt: string;
  avatar?: string | null;
}

export interface MerchantDetail extends Merchant {
  totalRevenue: number;
  address?: string;
}

export interface MerchantProduct {
  id: number;
  title: string;
  price: number;
  status: string;
  category: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface MerchantAuction {
  id: number;
  title: string;
  startPrice: number;
  currentPrice: number;
  status: string;
  imageUrl?: string | null;
  endTime: string;
  bidCount: number;
}

export interface MerchantsResponse {
  data: Merchant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MerchantFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const merchantsService = {
  list: async (filters?: MerchantFilters, signal?: AbortSignal): Promise<MerchantsResponse> => {
    const axiosRes = await getWithListFilters(
      baseClient.getInstance(),
      '/merchants',
      filters as Record<string, unknown> | undefined,
      signal,
    );
    const response = axiosRes.data as {
      data?: Merchant[];
      total?: number;
      pagination?: { total?: number; hasNext?: boolean };
    };
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const total = response.pagination?.total || response.total || (response.data?.length || 0);
    return {
      data: response.data || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  get: async (id: string): Promise<MerchantDetail> => {
    const client = baseClient.getInstance();
    const response = await client.get(`/merchants/${id}`);
    return response.data.data || response.data;
  },

  getProducts: async (id: string, signal?: AbortSignal): Promise<MerchantProduct[]> => {
    const client = baseClient.getInstance();
    const response = await client.get(`/merchants/${id}/products`, { signal });
    return response.data.data || response.data || [];
  },

  getAuctions: async (id: string, signal?: AbortSignal): Promise<MerchantAuction[]> => {
    const client = baseClient.getInstance();
    const response = await client.get(`/merchants/${id}/auctions`, { signal });
    return response.data.data || response.data || [];
  },
};
