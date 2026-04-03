/**
 * Auction API Service
 *
 * Handles all auction-related API calls
 */

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

// Base API URL - will be configurable via environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const AUCTION_ENDPOINT = '/auctions';

/**
 * Auction API Client
 */
export const auctionApi = {
  /**
   * Get all auctions with filters
   */
  list: async (filters?: AuctionFilters): Promise<AuctionsResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.categoryId) params.append('categoryId', String(filters.categoryId));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await fetch(`${API_BASE_URL}${AUCTION_ENDPOINT}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch auctions');
    return response.json();
  },

  /**
   * Get single auction by ID
   */
  get: async (id: number): Promise<Auction> => {
    const response = await fetch(`${API_BASE_URL}${AUCTION_ENDPOINT}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch auction');
    return response.json();
  },

  /**
   * Get auction by slug
   */
  getBySlug: async (slug: string): Promise<Auction> => {
    const response = await fetch(`${API_BASE_URL}${AUCTION_ENDPOINT}/slug/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch auction');
    return response.json();
  },

  /**
   * Create new auction
   */
  create: async (data: AuctionCreateInput): Promise<Auction> => {
    const response = await fetch(`${API_BASE_URL}${AUCTION_ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create auction');
    return response.json();
  },

  /**
   * Update existing auction
   */
  update: async (id: number, data: AuctionUpdateInput): Promise<Auction> => {
    const response = await fetch(`${API_BASE_URL}${AUCTION_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update auction');
    return response.json();
  },

  /**
   * Delete auction
   */
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}${AUCTION_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete auction');
  },

  /**
   * Get auction statistics
   */
  getStats: async (): Promise<AuctionStats> => {
    const response = await fetch(`${API_BASE_URL}${AUCTION_ENDPOINT}/stats`);
    if (!response.ok) throw new Error('Failed to fetch auction stats');
    return response.json();
  },

  /**
   * Get bids for an auction
   */
  getBids: async (auctionId: number): Promise<Bid[]> => {
    const response = await fetch(`${API_BASE_URL}${AUCTION_ENDPOINT}/${auctionId}/bids`);
    if (!response.ok) throw new Error('Failed to fetch bids');
    return response.json();
  },

  /**
   * Place a bid on an auction
   */
  placeBid: async (auctionId: number, bid: BidCreateInput): Promise<Bid> => {
    const response = await fetch(`${API_BASE_URL}${AUCTION_ENDPOINT}/${auctionId}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bid),
    });
    if (!response.ok) throw new Error('Failed to place bid');
    return response.json();
  },

  /**
   * Toggle watch status for an auction
   */
  toggleWatch: async (auctionId: number): Promise<{ watched: boolean }> => {
    const response = await fetch(`${API_BASE_URL}${AUCTION_ENDPOINT}/${auctionId}/watch`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to toggle watch status');
    }
    return response.json();
  },

  /**
   * Get watched auctions
   */
  getWatched: async (): Promise<Auction[]> => {
    const response = await fetch(`${API_BASE_URL}${AUCTION_ENDPOINT}/watched`);
    if (!response.ok) throw new Error('Failed to fetch watched auctions');
    return response.json();
  },

  /**
   * Upload auction images
   */
  uploadImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const response = await fetch(`${API_BASE_URL}${AUCTION_ENDPOINT}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload images');
    return response.json();
  },
};

/**
 * Bid API Client (standalone for clarity)
 */
export const bidApi = {
  /**
   * Get all bids for current user
   */
  getMyBids: async (filters?: { status?: string }): Promise<Bid[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const response = await fetch(`${API_BASE_URL}/bids/my?${params}`);
    if (!response.ok) throw new Error('Failed to fetch my bids');
    return response.json();
  },

  /**
   * Get bid history for an auction
   */
  getHistory: async (auctionId: number): Promise<Bid[]> => {
    const response = await fetch(`${API_BASE_URL}/bids/auction/${auctionId}/history`);
    if (!response.ok) throw new Error('Failed to fetch bid history');
    return response.json();
  },

  /**
   * Retract a bid
   */
  retract: async (bidId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/bids/${bidId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to retract bid');
  },
};

// Re-export types
export type * from '../types/auction.types';
