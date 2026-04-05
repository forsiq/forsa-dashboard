/**
 * GraphQL Queries & Mutations for Auctions
 * Uses 'auction' service
 */

import { AuctionStatus } from '../types/auction.types';

// ============ Queries ============

/**
 * Get paginated list of auctions
 */
export const GET_AUCTIONS_QUERY = `
  query GetAuctions(
    $limit: Int
    $offset: Int
    $search: String
    $status: String
    $categoryId: Int
    $sortBy: String
    $sortOrder: String
  ) {
    auctions(
      limit: $limit
      offset: $offset
      search: $search
      status: $status
      categoryId: $categoryId
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      id
      title
      description
      slug
      startPrice
      currentBid
      totalBids
      startTime
      endTime
      status
      bidIncrement
      categoryId
      images
      createdAt
      updatedAt
      currentBidderId
    }
    auctionCount(
      search: $search
      status: $status
      categoryId: $categoryId
    )
  }
`;

/**
 * Get a single auction by ID or slug
 */
export const GET_AUCTION_QUERY = `
  query GetAuction($id: ID, $slug: String) {
    auction(id: $id, slug: $slug) {
      id
      title
      description
      slug
      startPrice
      currentBid
      buyNowPrice
      reservePrice
      totalBids
      startTime
      endTime
      status
      bidIncrement
      categoryId
      images
      createdAt
      updatedAt
      currentBidderId
      category {
        id
        name
        nameAr
      }
    }
  }
`;

/**
 * Get auction statistics
 */
export const GET_AUCTION_STATS_QUERY = `
  query GetAuctionStats {
    auctionStats {
      totalAuctions
      activeAuctions
      scheduledAuctions
      endedAuctions
      totalBids
      totalRevenue
      avgWinningBid
    }
  }
`;

/**
 * Get bid history for an auction
 */
export const GET_AUCTION_BIDS_QUERY = `
  query GetAuctionBids($auctionId: ID!, $limit: Int, $offset: Int) {
    bids(auctionId: $auctionId, limit: $limit, offset: $offset) {
      id
      auctionId
      bidderId
      bidderName
      amount
      status
      createdAt
      isWinning
    }
    bidCount(auctionId: $auctionId)
  }
`;

// ============ Mutations ============

/**
 * Create a new auction
 */
export const CREATE_AUCTION_MUTATION = `
  mutation CreateAuction($input: AuctionInput!) {
    createAuction(input: $input) {
      id
      title
      slug
      status
    }
  }
`;

/**
 * Update an existing auction
 */
export const UPDATE_AUCTION_MUTATION = `
  mutation UpdateAuction($id: ID!, $input: AuctionInput!) {
    updateAuction(id: $id, input: $input) {
      id
      title
      status
    }
  }
`;

/**
 * Delete an auction
 */
export const DELETE_AUCTION_MUTATION = `
  mutation DeleteAuction($id: ID!) {
    deleteAuction(id: $id) {
      success
      message
    }
  }
`;

/**
 * Place a bid
 */
export const PLACE_BID_MUTATION = `
  mutation PlaceBid($input: BidInput!) {
    placeBid(input: $input) {
      id
      auctionId
      amount
      status
      createdAt
      isWinning
    }
  }
`;

// ============ Helper Functions ============

/**
 * Build variables for auction list query
 */
export function buildAuctionVariables(filters: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  return {
    limit: filters.limit || 50,
    offset: filters.page ? ((filters.page - 1) * (filters.limit || 50)) : 0,
    ...(filters.search && { search: filters.search }),
    ...(filters.status && filters.status !== 'all' && { status: filters.status }),
    ...(filters.categoryId && filters.categoryId !== 0 && { categoryId: filters.categoryId }),
    ...(filters.sortBy && { sortBy: filters.sortBy }),
    ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
  };
}
