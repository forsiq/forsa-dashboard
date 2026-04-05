/**
 * Auction GraphQL Module - Public API
 * Uses 'auction' service
 */

// Query Hooks
export {
  useGetAuctions,
  useGetAuction,
  useGetAuctionStats,
  useGetAuctionBids,
} from './hooks';

// Mutation Hooks
export {
  useCreateAuction,
  useUpdateAuction,
  useDeleteAuction,
  usePlaceBid,
} from './hooks';

// Query Keys
export { auctionGraphQLKeys as auctionKeys } from './api';

// Helper Functions
export {
  buildAuctionVariables,
} from './queries';

// Types
export type {
  Auction,
  AuctionsResponse,
  AuctionCreateInput,
  AuctionUpdateInput,
  Bid,
  BidCreateInput,
  AuctionFilters,
  AuctionStats,
} from '../types/auction.types';
