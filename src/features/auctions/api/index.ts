/**
 * Auction REST API Module - Public API
 */

// Hooks
export {
  useGetAuctions,
  useGetAuction,
  useGetAuctionStats,
  useGetAuctionBids,
  useGetMyBids,
  useCreateAuction,
  useUpdateAuction,
  useDeleteAuction,
  usePlaceBid,
  useToggleWatch,
} from './auction-hooks';

// API Client
export { auctionApi, bidApi } from './auction-api';

// Query Keys
export { auctionKeys } from './auction-hooks';

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
