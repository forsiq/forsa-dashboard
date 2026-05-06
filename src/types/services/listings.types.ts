export interface ProductListing {
  id: number;
  title: string;
  description: string;
  slug: string;
  categoryId: number;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  weight?: string;
  dimensions?: string;
  condition?: string;
  authenticity?: string;
  warranty?: string;
  manufacturer?: string;
  origin?: string;
  sku?: string;
  mainAttachmentId?: number;
  attachmentIds: number[];
  videoAttachmentId?: number;
  imageUrl?: string;
  images: string[];
  sellerId?: string | null;
  translations?: Record<string, Record<string, string>>;
  metadata?: Record<string, any>;
  projectId?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ListingFilters {
  search?: string;
  categoryId?: number;
  brand?: string;
  condition?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListingsResponse {
  data: ProductListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface DeployAuctionInput {
  startPrice: number;
  buyNowPrice?: number;
  reservePrice?: number;
  bidIncrement?: number;
  startTime: string;
  endTime: string;
}

export interface DeployGroupBuyInput {
  originalPrice: number;
  dealPrice: number;
  minParticipants: number;
  maxParticipants: number;
  startTime: string;
  endTime: string;
  autoCreateOrder?: boolean;
}

export interface CreateListingInput {
  title: string;
  description?: string;
  slug?: string;
  categoryId?: number;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  weight?: string;
  dimensions?: string;
  condition?: string;
  authenticity?: string;
  warranty?: string;
  manufacturer?: string;
  origin?: string;
  sku?: string;
  mainAttachmentId?: number;
  attachmentIds?: number[];
  videoAttachmentId?: number;
  imageUrl?: string;
  images?: string[];
  metadata?: Record<string, any>;
  translations?: Record<string, Record<string, string>>;
}

export type UpdateListingInput = Partial<CreateListingInput>;
