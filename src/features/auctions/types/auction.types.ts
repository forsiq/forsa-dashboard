/**
 * Auction Type Definitions
 */

export type AuctionStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'cancelled';

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'refunded';

export interface Auction {
  id: number;
  title: string;
  description: string;
  slug: string;
  startPrice: number;
  currentBid: number;
  buyNowPrice?: number;
  reservePrice?: number;
  totalBids: number;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  bidIncrement: number;
  categoryId: number;
  categoryName?: string;
  images: string[];
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  // Additional computed fields
  timeRemaining?: number;
  isWatched?: boolean;
  canBid?: boolean;
  winnerId?: number;
  winnerName?: string;
}

export interface Bid {
  id: number;
  auctionId: number;
  bidderId: number;
  bidderName?: string;
  bidderAvatar?: string;
  amount: number;
  status: BidStatus;
  createdAt: string;
  isAutoBid?: boolean;
  maxAmount?: number;
  isWinning?: boolean;
}

export interface AuctionCreateInput {
  title: string;
  description: string;
  startPrice: number;
  buyNowPrice?: number;
  reservePrice?: number;
  startTime: string;
  endTime: string;
  bidIncrement: number;
  categoryId: number;
  images: string[];
  mainAttachmentId?: number;
  attachmentIds?: number[];
}

export interface AuctionUpdateInput extends Partial<AuctionCreateInput> {
  id: string | number;
  status?: AuctionStatus;
}


export interface BidCreateInput {
  auctionId?: number; // Optional since it's passed as URL param
  amount: number;
  maxAmount?: number; // For auto-bidding
  isAutoBid?: boolean;
}

export interface AuctionFilters {
  status?: AuctionStatus;
  categoryId?: number;
  search?: string;
  sortBy?: 'endTime' | 'startTime' | 'currentBid' | 'totalBids' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AuctionsResponse {
  data: Auction[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AuctionStats {
  totalAuctions: number;
  activeAuctions: number;
  scheduledAuctions: number;
  endedAuctions: number;
  totalBids: number;
  totalRevenue: number;
  avgWinningBid: number;
}
