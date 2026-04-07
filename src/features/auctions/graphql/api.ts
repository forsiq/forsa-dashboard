/**
 * Auction GraphQL API Service
 * Uses 'auction' service
 */

import { gqlQuery, gqlMutation } from '@core/services/GraphQLClient';
import * as queries from './queries';
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

const SERVICE_NAME = 'auction';

/**
 * Get paginated list of auctions
 */
export async function getAuctions(filters: AuctionFilters = {}): Promise<AuctionsResponse> {
  const variables = queries.buildAuctionVariables(filters);
  const data = await gqlQuery<{ auctions: Auction[] }>(
    queries.GET_AUCTIONS_QUERY,
    variables,
    SERVICE_NAME
  );

  const auctions = data.auctions || [];
  const total = auctions.length; // auctionCount field not available, use returned count

  return {
    data: auctions,
    total,
    page: filters.page || 1,
    limit: filters.limit || 50,
    hasMore: auctions.length >= (filters.limit || 50), // Assume more if we got a full page
  };
}

/**
 * Get single auction by ID
 */
export async function getAuction(id: number | string): Promise<Auction> {
  const variables = isNaN(Number(id)) ? { slug: String(id) } : { id: String(id) };
  const data = await gqlQuery<{ auction: Auction }>(
    queries.GET_AUCTION_QUERY,
    variables,
    SERVICE_NAME
  );
  return data.auction;
}

/**
 * Get auction statistics
 * Note: auctionStats field not available, calculating from auctions list
 */
export async function getAuctionStats(): Promise<AuctionStats> {
  try {
    // Fetch all auctions to calculate stats
    const data = await gqlQuery<{ auctions: Auction[] }>(
      `query GetAuctions($limit: Int) { auctions(limit: $limit) { id status currentBid startPrice } }`,
      { limit: 1000 },
      SERVICE_NAME
    );

    const auctions = data.auctions || [];
    const activeAuctions = auctions.filter(a => a.status === 'active').length;
    const scheduledAuctions = auctions.filter(a => a.status === 'scheduled').length;
    const cancelledAuctions = auctions.filter(a => a.status === 'cancelled').length;
    const endedAuctions = cancelledAuctions;
    const totalRevenue = auctions
      .filter(a => a.status === 'active')
      .reduce((sum, a) => sum + (a.currentBid || 0), 0);
    const totalBids = 0; // Not available in auction object
    const avgWinningBid = activeAuctions > 0 ? totalRevenue / activeAuctions : 0;

    return {
      totalAuctions: auctions.length,
      activeAuctions,
      scheduledAuctions,
      endedAuctions,
      totalBids,
      totalRevenue,
      avgWinningBid,
    };
  } catch (error) {
    // Return empty stats on error
    return {
      totalAuctions: 0,
      activeAuctions: 0,
      scheduledAuctions: 0,
      endedAuctions: 0,
      totalBids: 0,
      totalRevenue: 0,
      avgWinningBid: 0,
    };
  }
}

/**
 * Get bid history for an auction
 */
export async function getAuctionBids(auctionId: number | string, page = 1, limit = 20): Promise<{ data: Bid[]; total: number }> {
  const data = await gqlQuery<{ bids: Bid[]; bidCount: number }>(
    queries.GET_AUCTION_BIDS_QUERY,
    { auctionId: String(auctionId), limit, offset: (page - 1) * limit },
    SERVICE_NAME
  );
  return {
    data: data.bids,
    total: data.bidCount,
  };
}

/**
 * Create a new auction
 */
export async function createAuction(input: AuctionCreateInput): Promise<Auction> {
  const data = await gqlMutation<{ createAuction: Auction }>(
    queries.CREATE_AUCTION_MUTATION,
    { input },
    SERVICE_NAME
  );
  return data.createAuction;
}

/**
 * Update an existing auction
 */
export async function updateAuction(id: number | string, input: AuctionUpdateInput): Promise<Auction> {
  const data = await gqlMutation<{ updateAuction: Auction }>(
    queries.UPDATE_AUCTION_MUTATION,
    { id: String(id), input },
    SERVICE_NAME
  );
  return data.updateAuction;
}

/**
 * Delete an auction
 */
export async function deleteAuction(id: number | string): Promise<void> {
  await gqlMutation(
    queries.DELETE_AUCTION_MUTATION,
    { id: String(id) },
    SERVICE_NAME
  );
}

/**
 * Place a bid
 */
export async function placeBid(input: BidCreateInput): Promise<Bid> {
  const data = await gqlMutation<{ placeBid: Bid }>(
    queries.PLACE_BID_MUTATION,
    { input: { ...input, auctionId: String(input.auctionId) } },
    SERVICE_NAME
  );
  return data.placeBid;
}

/**
 * Query Keys for React Query
 */
export const auctionGraphQLKeys = {
  all: ['auctions'] as const,
  lists: () => [...auctionGraphQLKeys.all, 'list'] as const,
  list: (filters: AuctionFilters) => [...auctionGraphQLKeys.lists(), filters] as const,
  details: () => [...auctionGraphQLKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...auctionGraphQLKeys.details(), id] as const,
  stats: () => [...auctionGraphQLKeys.all, 'stats'] as const,
  bids: (auctionId: number | string) => [...auctionGraphQLKeys.all, 'bids', auctionId] as const,
};
