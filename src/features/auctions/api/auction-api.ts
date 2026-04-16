/**
 * Auction API Service
 * Comprehensive REST API implementation for Forsa Auctions
 */

import { createApiClient } from '@core/services/ApiClientFactory';
import { withAuctionPhotoFallback } from '@core/utils/devPhotoFallback';
import type {
  Auction,
  AuctionsResponse,
  AuctionCreateInput,
  AuctionUpdateInput,
  Bid,
  BidCreateInput,
  AuctionFilters,
  AuctionStats,
} from '../types/auction.types';

/**
 * Base Auction API implementation using shared factory
 */
export const auctionBaseApi = createApiClient<Auction, AuctionCreateInput, AuctionUpdateInput, AuctionFilters>({
  serviceName: 'auctions',
  endpoint: '/auctions',
});

/**
 * Auction API - main auction operations with custom methods
 */
export const auctionApi = {
  /**
   * Get paginated list of auctions
   */
  list: async (filters?: AuctionFilters): Promise<AuctionsResponse> => {
    const response = await auctionBaseApi.list(filters) as any;
    const raw = response.data || [];
    const data = raw.map((row: Record<string, unknown>) => withAuctionPhotoFallback(row)) as Auction[];
    // Compatibility layer: REST API returns { data, total, page, limit }
    return {
      data,
      total: response.total || (response.data?.length || 0),
      page: filters?.page || 1,
      limit: filters?.limit || 50,
      hasMore: (response.total || 0) > (filters?.page || 1) * (filters?.limit || 50),
    };
  },

  /**
   * Get single auction by ID
   */
  get: async (id: number | string): Promise<Auction> => {
    const response = await auctionBaseApi.getById(String(id));
    return withAuctionPhotoFallback(response.data as unknown as Record<string, unknown>) as unknown as Auction;
  },

  /**
   * Get auction by slug
   */
  getBySlug: async (slug: string): Promise<Auction> => {
    const response = await auctionBaseApi.getById(slug);
    return withAuctionPhotoFallback(response.data as unknown as Record<string, unknown>) as unknown as Auction;
  },


  /**
   * Create a new auction
   */
  create: async (data: AuctionCreateInput): Promise<Auction> => {
    const response = await auctionBaseApi.create(data);
    return response.data;
  },

  /**
   * Update an existing auction
   */
  update: async (id: number, data: AuctionUpdateInput): Promise<Auction> => {
    const response = await auctionBaseApi.update({ ...data, id: String(id) });
    return response.data;
  },

  /**
   * Delete an auction
   */
  delete: async (id: number): Promise<void> => {
    await auctionBaseApi.delete(String(id));
  },

  /**
   * End auction manually
   */
  end: async (id: number | string): Promise<void> => {
    const client = auctionBaseApi.getInstance();
    await client.post(`/auctions/${id}/end/`);
  },

  /**
   * Get auction statistics
   */
  getStats: async (): Promise<AuctionStats> => {
    const response = await auctionBaseApi.getStats();
    // Map REST stats to AuctionStats interface
    const stats = response.data;
    return {
      totalAuctions: stats.total || 0,
      activeAuctions: stats.active || 0,
      scheduledAuctions: stats.scheduled || 0,
      endedAuctions: stats.ended || 0,
      totalBids: stats.bids || 0,
      totalRevenue: stats.revenue || 0,
      avgWinningBid: stats.avg_bid || 0,
    };
  },

  /**
   * Toggle watch status (Engagement API)
   */
  toggleWatch: async (auctionId: number, isLiked: boolean): Promise<void> => {
    const client = auctionBaseApi.getInstance();
    const endpoint = isLiked ? '/engagement/unlike/' : '/engagement/like/';
    await client.post(endpoint, { auctionId });
  },

  /**
   * Track view
   */
  trackView: async (auctionId: number): Promise<void> => {
    const client = auctionBaseApi.getInstance();
    await client.post('/engagement/view/', { auctionId });
  },
};

/**
 * Bid API - bid specific operations
 */
export const bidApi = {
  /**
   * Get bids for an auction
   */
  list: async (auctionId: number | string, page = 1, limit = 20): Promise<{ data: Bid[]; total: number }> => {
    const response = await auctionBaseApi.getInstance().get('/bids/', {
      params: { auctionId, page, limit }
    });
    return {
      data: response.data.data,
      total: response.data.total,
    };
  },

  /**
   * Place a bid
   */
  create: async (input: BidCreateInput): Promise<Bid> => {
    const response = await auctionBaseApi.getInstance().post('/bids/', input);
    return response.data.data;
  },

  /**
   * Get my bids
   */
  getMyBids: async (page = 1, limit = 20): Promise<{ data: Bid[]; total: number }> => {
    const response = await auctionBaseApi.getInstance().get('/my-bids/', {
      params: { page, limit }
    });
    return {
      data: response.data.data,
      total: response.data.total,
    };
  },
};

