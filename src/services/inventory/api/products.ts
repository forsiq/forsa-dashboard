/** Inventory API - Using REST */
import { createApiClient } from '@core/services/ApiClientFactory';
import type { 
  Product, 
  CreateProductInput, 
  UpdateProductInput, 
  ProductFilters,
  InventoryStats,
  ProductsResponse 
} from '../types';

/**
 * Base Inventory API implementation
 */
export const inventoryBaseApi = createApiClient<Product, CreateProductInput, UpdateProductInput, ProductFilters>({
  serviceName: 'inventory',
  endpoint: '/inventory',
});

export async function getProducts(filters: ProductFilters = {} as any): Promise<ProductsResponse> {
  const response = await inventoryBaseApi.list(filters) as any;
  const products = response.data || [];
  
  return {
    data: products,
    total: response.total || products.length,
    page: filters.page || 1,
    limit: filters.limit || 50,
    totalPages: Math.ceil((response.total || products.length) / (filters.limit || 50)),
  };
}

export async function getProduct(id: string): Promise<Product> {
  const response = await inventoryBaseApi.getById(id);
  return response.data;
}

export async function getInventoryStats(): Promise<InventoryStats> {
  const response = await inventoryBaseApi.getStats();
  const stats = response.data;
  return {
    totalProducts: stats.total_products || 0,
    inStock: stats.in_stock || 0,
    lowStock: stats.low_stock || 0,
    outOfStock: stats.out_of_stock || 0,
    totalValue: stats.total_value || 0,
    lowStockValue: stats.low_stock_value || 0,
    totalStock: stats.total_stock || 0,
    recentMovements: stats.recent_movements || 0
  };
}

export async function getStats() {
  return getInventoryStats();
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const response = await inventoryBaseApi.create(input);
  return response.data;
}

export async function updateProduct(input: UpdateProductInput): Promise<Product> {
  const response = await inventoryBaseApi.update({ ...input, id: String(input.id) } as any);
  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await inventoryBaseApi.delete(id);
}

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...inventoryKeys.lists(), filters] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  stats: () => [...inventoryKeys.all, 'stats'] as const,
};