/**
 * Auction API Service
 * REST-like wrapper around GraphQL API
 */

import * as graphqlApi from '../graphql/api';
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
 * Auction API - main auction operations
 */
export const auctionApi = {
  /**
   * Get paginated list of auctions
   */
  list: (filters?: AuctionFilters): Promise<AuctionsResponse> => {
    return graphqlApi.getAuctions(filters);
  },

  /**
   * Get single auction by ID
   */
  get: (id: number): Promise<Auction> => {
    return graphqlApi.getAuction(id);
  },

  /**
   * Get auction by slug
   */
  getBySlug: (slug: string): Promise<Auction> => {
    return graphqlApi.getAuction(slug);
  },

  /**
   * Create a new auction
   */
  create: (data: AuctionCreateInput): Promise<Auction> => {
    return graphqlApi.createAuction(data);
  },

  /**
   * Update an existing auction
   */
  update: (id: number, data: AuctionUpdateInput): Promise<Auction> => {
    return graphqlApi.updateAuction(id, data);
  },

  /**
   * Delete an auction
   */
  delete: (id: number): Promise<void> => {
    return graphqlApi.deleteAuction(id);
  },

  /**
   * Get auction statistics
   */
  getStats: (): Promise<AuctionStats> => {
    return graphqlApi.getAuctionStats();
  },

  /**
   * Get watched auctions
   */
  getWatched: (): Promise<Auction[]> => {
    // TODO: Implement when GraphQL supports it
    return Promise.resolve([]);
  },

  /**
   * Toggle watch status
   */
  toggleWatch: (auctionId: number): Promise<void> => {
    // TODO: Implement when GraphQL supports it
    return Promise.resolve(undefined);
  },

  /**
   * Get bids for an auction
   */
  getBids: (auctionId: number): Promise<Bid[]> => {
    return graphqlApi.getAuctionBids(auctionId).then(r => r.data);
  },

  /**
   * Place a bid
   */
  placeBid: (auctionId: number, input: BidCreateInput): Promise<Bid> => {
    return graphqlApi.placeBid({ ...input, auctionId });
  },
};

/**
 * Bid API - bid specific operations
 */
export const bidApi = {
  /**
   * Get bids for an auction
   */
  list: (auctionId: number, page = 1, limit = 20): Promise<{ data: Bid[]; total: number }> => {
    return graphqlApi.getAuctionBids(auctionId, page, limit);
  },

  /**
   * Place a bid
   */
  create: (input: BidCreateInput): Promise<Bid> => {
    return graphqlApi.placeBid(input);
  },
};
