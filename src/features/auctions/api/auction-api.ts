/**
 * Auction API Service
 * Comprehensive REST API implementation for Forsa Auctions
 */

import { createApiClient } from '@core/services/ApiClientFactory';
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
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const total = response.pagination?.total || response.total || (response.data?.length || 0);
    return {
      data: response.data || [],
      total,
      page,
      limit,
      hasMore: response.pagination?.hasNext ?? (total > page * limit),
    };
  },

  /**
   * Get single auction by ID
   */
  get: async (id: number | string): Promise<Auction> => {
    const response = await auctionBaseApi.getById(String(id));
    return response.data;
  },

  /**
   * Get auction by slug
   */
  getBySlug: async (slug: string): Promise<Auction> => {
    const response = await auctionBaseApi.getById(slug);
    return response.data;
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
  end: async (id: number | string): Promise<Auction> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.post(`/auctions/${id}/end/`);
    return response.data.data;
  },

  /**
   * Start auction: draft/scheduled -> active
   */
  start: async (id: number | string): Promise<Auction> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.post(`/auctions/${id}/start/`);
    return response.data.data;
  },

  /**
   * Pause auction: active -> paused
   */
  pause: async (id: number | string): Promise<Auction> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.post(`/auctions/${id}/pause/`);
    return response.data.data;
  },

  /**
   * Resume auction: paused -> active
   */
  resume: async (id: number | string): Promise<Auction> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.post(`/auctions/${id}/resume/`);
    return response.data.data;
  },

  /**
   * Cancel auction: any -> cancelled
   */
  cancel: async (id: number | string): Promise<Auction> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.post(`/auctions/${id}/cancel/`);
    return response.data.data;
  },

  /**
   * Buy Now - purchase auction at buyNowPrice
   */
  buyNow: async (id: number | string): Promise<Auction> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.post(`/auctions/${id}/buy-now/`);
    return response.data.data;
  },

  /**
   * Get auction statistics
   */
  getStats: async (): Promise<AuctionStats> => {
    const response = await auctionBaseApi.getStats();
    // Map REST stats to AuctionStats interface
    const stats = response.data;
    return {
      totalAuctions: stats.totalAuctions || stats.total || 0,
      activeAuctions: stats.activeAuctions || stats.active || 0,
      scheduledAuctions: stats.endingSoonAuctions || stats.scheduled || 0,
      endedAuctions: stats.soldAuctions || stats.ended || 0,
      totalBids: stats.totalBids || stats.bids || 0,
      totalRevenue: stats.totalRevenue || stats.revenue || 0,
      avgWinningBid: stats.avgWinningBid || stats.avg_bid || 0,
    };
  },

  /**
   * Toggle watch status (Engagement API)
   */
  toggleWatch: async (auctionId: number, isLiked?: boolean): Promise<void> => {
    const client = auctionBaseApi.getInstance();
    if (isLiked) {
      await client.delete(`/favorites/${auctionId}/auction`);
      return;
    }

    await client.post('/favorites', {
      itemId: auctionId,
      itemType: 'auction',
    });
  },

  /**
   * Track view
   */
  trackView: async (auctionId: number): Promise<void> => {
    // No dedicated endpoint exists in auction-service right now.
    // Keep this as a no-op to avoid 404 noise until backend adds it.
    return Promise.resolve();
  },

  /**
   * Get watched auctions
   */
  getWatched: async (): Promise<Auction[]> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.get('/favorites', {
      params: { itemType: 'auction' },
    });

    const favorites = response.data?.data || [];
    return favorites.map((favorite: any) => favorite.item).filter(Boolean);
  },

  /**
   * Get bids for an auction (Alias for bidApi.list)
   */
  getBids: async (auctionId: number | string) => {
    return bidApi.list(auctionId);
  },

  /**
   * Place a bid (Alias for bidApi.create)
   */
  placeBid: async (auctionId: number | string, input: any) => {
    return bidApi.create(input);
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
    const response = await auctionBaseApi.getInstance().get('/bids/history', {
      params: { page, limit }
    });
    return {
      data: response.data.data,
      total: response.data.total,
    };
  },
};

/**
 * Live Monitor API - real-time monitoring endpoints
 */
export const liveMonitorApi = {
  getLiveStats: async (): Promise<{
    activeAuctions: number;
    endingSoonAuctions: number;
    recentBidsCount: number;
    timestamp: string;
  }> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.get('/auctions/live-stats');
    return response.data.data;
  },

  getCriticalAuctions: async (): Promise<any[]> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.get('/auctions/critical');
    return response.data.data;
  },

  getTickerHistory: async (limit = 100): Promise<any[]> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.get('/auctions/ticker/history', {
      params: { limit },
    });
    return response.data.data;
  },

  extendAuction: async (id: number | string, minutes = 15): Promise<Auction> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.post(`/auctions/${id}/extend`, { minutes });
    return response.data.data;
  },
};

export interface SettlementItem {
  id: number;
  title: string;
  image: string | null;
  status: string;
  paymentStatus: string;
  finalPrice: number | null;
  startPrice: number;
  currency: string;
  endTime: string;
  winnerId: string | null;
  winningBid: {
    id: number;
    amount: number;
    bidderId: string;
    createdAt: string;
  } | null;
  createdAt: string;
}

export interface SettlementsResponse {
  items: SettlementItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const settlementApi = {
  getSettlements: async (filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<SettlementsResponse> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.get('/settlements', { params: filters });
    return response.data;
  },

  updatePaymentStatus: async (id: number | string, paymentStatus: string): Promise<Auction> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.patch(`/auctions/${id}/payment-status`, { paymentStatus });
    return response.data.data;
  },

  nudgeWinner: async (id: number | string): Promise<{ sent: boolean; winnerId: string }> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.post(`/auctions/${id}/nudge-winner`);
    return response.data.data;
  },

  offerToUnderbidder: async (id: number | string): Promise<{ sent: boolean; underbidderId: string | null }> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.post(`/auctions/${id}/offer-underbidder`);
    return response.data.data;
  },
};

export interface AllBidsItem {
  id: number;
  auctionId: number;
  bidderId: string;
  amount: number;
  status: string;
  isAutoBid: boolean;
  maxAmount: number | null;
  createdAt: string;
  auction: {
    id: number;
    title: string;
  } | null;
}

export interface AllBidsResponse {
  items: AllBidsItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const moderationApi = {
  getAllBids: async (filters?: {
    page?: number;
    limit?: number;
    auctionId?: number;
    bidderId?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<AllBidsResponse> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.get('/moderation/bids', { params: filters });
    return response.data;
  },

  voidBid: async (bidId: number | string): Promise<any> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.post(`/bids/${bidId}/void`);
    return response.data.data;
  },

  suspendUser: async (userId: string): Promise<{ success: boolean; userId: string }> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.post(`/users/${userId}/suspend`);
    return response.data.data;
  },

  unsuspendUser: async (userId: string): Promise<{ success: boolean; userId: string }> => {
    const client = auctionBaseApi.getInstance();
    const response = await client.post(`/users/${userId}/unsuspend`);
    return response.data.data;
  },
};

