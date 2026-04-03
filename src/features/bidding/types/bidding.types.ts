/**
 * Bidding Type Definitions
 */

import type { Auction } from '../../auctions/types/auction.types';

export interface LiveBiddingState {
  isConnected: boolean;
  currentBid: number;
  bidCount: number;
  timeRemaining: number;
  bids: BidUpdate[];
}

export interface BidUpdate {
  id: number;
  auctionId: number;
  amount: number;
  bidderName: string;
  timestamp: number;
  isAutoBid?: boolean;
}

export interface BiddingFormState {
  amount: number;
  maxAmount?: number;
  useAutoBid: boolean;
}

export interface AutoBidConfig {
  enabled: boolean;
  maxAmount: number;
  increment: number;
}

export interface BiddingRoom {
  auctionId: number;
  auction: Auction;
  participants: number;
  currentBid: number;
  minNextBid: number;
  bidIncrement: number;
  endTime: string;
}

// WebSocket message types
export type WSMessageType =
  | 'bid_placed'
  | 'bid_updated'
  | 'auction_ending'
  | 'auction_ended'
  | 'price_updated'
  | 'timer_update'
  | 'error';

export interface WSMessage {
  type: WSMessageType;
  data: any;
  auctionId: number;
  timestamp: number;
}
