// Inventory types
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
export type ProductType = 'simple' | 'variable' | 'bundle';

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  nameKu?: string;
  sku: string;
  barcode?: string;
  type: ProductType;
  description?: string;
  descriptionAr?: string;
  descriptionKu?: string;
  categoryId?: string;
  category?: Category;
  brandId?: string;
  brand?: Brand;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currency: string;
  taxRate: number;
  stockQuantity: number;
  lowStockThreshold: number;
  stockStatus: StockStatus;
  images: string[];
  isActive: boolean;
  attributes?: Record<string, string | number | boolean>;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  attributes: Record<string, string>;
  stockQuantity: number;
  priceAdjustment: number;
}

export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  nameKu?: string;
  parentId?: string;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product?: Product;
  type: 'in' | 'out' | 'transfer' | 'adjustment' | 'return';
  quantity: number;
  reference?: string;
  notes?: string;
  warehouseId?: string;
  userId?: string;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  isActive: boolean;
}

export interface CreateProductInput {
  name: string;
  nameAr?: string;
  nameKu?: string;
  sku: string;
  barcode?: string;
  type: ProductType;
  description?: string;
  descriptionAr?: string;
  descriptionKu?: string;
  categoryId?: string;
  brandId?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currency?: string;
  taxRate?: number;
  lowStockThreshold?: number;
  images?: string[];
  attributes?: Record<string, string | number | boolean>;
  variants?: Omit<ProductVariant, 'id' | 'productId'>[];
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  nameAr?: string;
  nameKu?: string;
  sku?: string;
  barcode?: string;
  description?: string;
  descriptionAr?: string;
  descriptionKu?: string;
  categoryId?: string;
  brandId?: string;
  unit?: string;
  costPrice?: number;
  sellingPrice?: number;
  taxRate?: number;
  lowStockThreshold?: number;
  images?: string[];
  attributes?: Record<string, string | number | boolean>;
  isActive?: boolean;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
  stockStatus?: StockStatus | 'all';
  type?: ProductType | 'all';
  isActive?: boolean | 'all';
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'stockQuantity' | 'sellingPrice' | 'costPrice';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StockMovementFilters {
  productId?: string;
  type?: StockMovement['type'] | 'all';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface StockMovementsResponse {
  data: StockMovement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InventoryStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  lowStockValue: number;
  totalStock: number;
  recentMovements: number;
}
