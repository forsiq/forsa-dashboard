/**
 * Item types for the Auction project
 */

export type ItemStatus = 'available' | 'in-auction' | 'sold' | 'draft';

export interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  startingBid: number;
  currentBid?: number;
  sellingPrice?: number;
  stockQuantity?: number;
  image?: string;
  status: ItemStatus;
  auctionCount: number;
  isWatched: boolean;
  createdAt: string;
}

export interface ItemFilters {
  search?: string;
  category?: string;
  categoryId?: number;
  status?: ItemStatus | 'all';
  page?: number;
  limit?: number;
}
