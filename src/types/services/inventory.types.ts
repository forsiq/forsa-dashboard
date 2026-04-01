/**
 * Inventory Types
 * Ready-made service types - DO NOT MODIFY unless necessary
 */

import type { ApiResponse } from '../common';

/**
 * Product entity
 */
export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  categoryName?: string;
  description?: string;
  price: number;
  cost: number;
  currency: string;
  stock: number;
  lowStockThreshold: number;
  warehouseId?: string;
  warehouseName?: string;
  unit?: string;
  weight?: number;
  dimensions?: string;
  images?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Warehouse entity
 */
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  manager?: string;
  phone?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Stock movement
 */
export interface StockMovement {
  id: string;
  productId: string;
  productName?: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment';
  quantity: number;
  warehouseId?: string;
  warehouseName?: string;
  reason?: string;
  reference?: string;
  userId?: string;
  createdAt: string;
}

/**
 * Create product request
 */
export interface CreateProductRequest {
  name: string;
  nameAr?: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  description?: string;
  price: number;
  cost: number;
  currency?: string;
  stock: number;
  lowStockThreshold: number;
  warehouseId?: string;
  unit?: string;
  images?: string[];
  isActive?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

/**
 * Inventory list query params
 */
export interface GetInventoryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  warehouseId?: string;
  lowStock?: boolean;
  isActive?: boolean;
}

/**
 * Inventory list response
 */
export interface GetInventoryResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Inventory stats
 */
export interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  warehouseCount: number;
}

/**
 * API response types for inventory
 */
export type InventoryListResponse = ApiResponse<GetInventoryResponse>;
export type ProductDetailResponse = ApiResponse<{ product: Product }>;
export type InventoryStatsResponse = ApiResponse<InventoryStats>;
