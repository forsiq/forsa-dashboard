/**
 * Ticker Type Definitions
 * Types for the global bid ticker and live monitoring
 */

export type TickerEventType =
  | 'bid_placed'
  | 'auction_sold'
  | 'auction_ended'
  | 'auction_cancelled'
  | 'auction_ending'
  | 'auction_updated';

export interface TickerEvent {
  type: TickerEventType;
  auctionId: number;
  auctionTitle?: string;
  categoryName?: string;
  bidId?: number;
  bidderId?: string;
  bidderName?: string;
  amount?: number;
  previousBid?: number;
  winnerId?: string;
  minutesLeft?: number;
  timestamp: string;
}

export interface LiveStats {
  activeAuctions: number;
  endingSoonAuctions: number;
  recentBidsCount: number;
  timestamp: string;
}

export interface CriticalAuction {
  id: number;
  title: string;
  currentBid: number;
  totalBids: number;
  endTime: string;
  categoryId: number;
  status: string;
  startTime: string;
}

export interface TickerHistoryItem {
  bidId: number;
  auctionId: number;
  auctionTitle: string;
  bidderId: string;
  bidderName: string | null;
  amount: number;
  timestamp: string;
}

export type TickerWSMessageType =
  | 'ticker:bid'
  | 'ticker:auction_sold'
  | 'ticker:auction_ended'
  | 'ticker:auction_cancelled'
  | 'ticker:auction_ending'
  | 'ticker:auction_updated'
  | 'ticker:joined'
  | 'pong';

export interface TickerWSMessage {
  type: TickerWSMessageType;
  data?: any;
  timestamp?: number;
  auctionId?: number;
}
