// Inventory types - aligned with backend WarehouseItem entity
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';

export interface ProductListingRef {
  id: number;
  title: string;
  description?: string;
  categoryId?: number;
  brand?: string;
  model?: string;
  sku?: string;
  barcode?: string;
  imageUrl?: string;
  images?: string[];
  mainAttachmentId?: number;
  attachmentIds?: number[];
}

export interface Product {
  id: string | number;
  listingId: number;
  listing?: ProductListingRef | null;
  sku: string;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  currency: string;
  unit: string;
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  isActive: boolean;
  notes?: string;
  metadata?: Record<string, any>;
  movements?: StockMovement[];
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string | number;
  warehouseItemId: number;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  previousQuantity: number;
  reference?: string;
  notes?: string;
  performedBy?: string;
  createdAt: string;
}

export interface CreateProductInput {
  listingId: number;
  sku: string;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  currency?: string;
  unit?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  notes?: string;
}

export interface UpdateProductInput {
  id: string | number;
  listingId?: number;
  sku?: string;
  barcode?: string;
  costPrice?: number;
  sellingPrice?: number;
  currency?: string;
  unit?: string;
  lowStockThreshold?: number;
  isActive?: boolean;
  notes?: string;
}

export interface AdjustStockInput {
  quantity: number;
  reference?: string;
  notes?: string;
}

export interface ProductFilters {
  search?: string;
  stockStatus?: StockStatus | 'all';
  isActive?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'sku' | 'costPrice' | 'sellingPrice' | 'stockQuantity';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InventoryStats {
  totalItems: number;
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  lowStockValue: number;
  totalStock: number;
  recentMovements: number;
}
