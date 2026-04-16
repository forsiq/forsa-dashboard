/**
 * Auction Feature Exports
 */

// Types
export type * from './types/auction.types';

// API
export { auctionApi, bidApi } from './api/auction-api';

// Hooks
export {
  auctionKeys,
  useAuctions,
  useAuction,
  useAuctionBySlug,
  useCreateAuction,
  useUpdateAuction,
  useDeleteAuction,
  useAuctionStats,
  useWatchedAuctions,
  useToggleWatch,
  useAuctionBids,
  usePlaceBid,
} from './hooks/useAuctions';

// Components - will be added as we create them
// export { default as AuctionCard } from './components/AuctionCard';
// export { default as AuctionTimer } from './components/AuctionTimer';
// etc.
