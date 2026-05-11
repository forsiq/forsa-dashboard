import { createApiClient } from '@core/services/ApiClientFactory';
import { getWithListFilters } from '@core/services/serviceListFetch';
import type {
  ProductListing,
  CreateListingInput,
  UpdateListingInput,
  ListingFilters,
  ListingsResponse,
  DeployAuctionInput,
  DeployGroupBuyInput,
} from '../../../types/services/listings.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.zonevast.com/forsa/api/v1';

const listingBaseApi = createApiClient<ProductListing, CreateListingInput, UpdateListingInput, ListingFilters>({
  serviceName: 'listings',
  endpoint: '/listings',
  apiBaseUrl: API_BASE_URL,
});

export const listingApi = {
  list: async (filters?: ListingFilters, signal?: AbortSignal): Promise<ListingsResponse> => {
    const axiosRes = await getWithListFilters(
      listingBaseApi.getInstance(),
      '/listings/',
      filters as Record<string, unknown> | undefined,
      signal,
    );
    const raw = axiosRes.data as {
      data?: ProductListing[];
      pagination?: ListingsResponse['pagination'];
      total?: number;
    };
    return {
      data: raw.data || [],
      pagination: raw.pagination || {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        total: raw.total || 0,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    };
  },

  get: async (id: number | string): Promise<ProductListing> => {
    const response = await listingBaseApi.getById(String(id));
    return (response as any).data;
  },

  create: async (data: CreateListingInput): Promise<ProductListing> => {
    const response = await listingBaseApi.create(data);
    return (response as any).data;
  },

  update: async (id: number, data: UpdateListingInput): Promise<ProductListing> => {
    const response = await listingBaseApi.update({ ...data, id: String(id) });
    return (response as any).data;
  },

  delete: async (id: number): Promise<void> => {
    await listingBaseApi.delete(String(id));
  },

  deployAsAuction: async (id: number, data: DeployAuctionInput): Promise<any> => {
    const client = listingBaseApi.getInstance();
    const response = await client.post(`/listings/${id}/deploy/auction`, data);
    return response.data.data;
  },

  deployAsGroupBuy: async (id: number, data: DeployGroupBuyInput): Promise<any> => {
    const client = listingBaseApi.getInstance();
    const response = await client.post(`/listings/${id}/deploy/group-buy`, data);
    return response.data.data;
  },

  getListingAuctions: async (id: number): Promise<any[]> => {
    const client = listingBaseApi.getInstance();
    const response = await client.get(`/listings/${id}/auctions`);
    return response.data.data || [];
  },

  getListingDeals: async (id: number): Promise<any[]> => {
    const client = listingBaseApi.getInstance();
    const response = await client.get(`/listings/${id}/deals`);
    return response.data.data || [];
  },
};
