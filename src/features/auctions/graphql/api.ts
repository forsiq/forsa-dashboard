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
  const data = await gqlQuery<{ auctions: Auction[]; auctionCount: number }>(
    queries.GET_AUCTIONS_QUERY,
    variables,
    SERVICE_NAME
  );

  return {
    data: data.auctions,
    total: data.auctionCount,
    page: filters.page || 1,
    limit: filters.limit || 50,
    hasMore: (filters.page || 1) * (filters.limit || 50) < data.auctionCount,
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
 */
export async function getAuctionStats(): Promise<AuctionStats> {
  const data = await gqlQuery<{ auctionStats: AuctionStats }>(
    queries.GET_AUCTION_STATS_QUERY,
    {},
    SERVICE_NAME
  );
  return data.auctionStats;
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
