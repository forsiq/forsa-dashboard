/**
 * Inventory GraphQL API Service
 * Uses 'inventory' service
 */

import { gqlQuery, gqlMutation } from '@core/services/GraphQLClient';
import * as queries from './queries';
import type {
  Product,
  ProductsResponse,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  InventoryStats,
} from '../types';

const SERVICE_NAME = 'product';

/**
 * Get paginated list of products
 */
export async function getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  try {
    const variables = queries.buildProductVariables(filters);
    const data = await gqlQuery<{ products: Product[] }>(
      queries.GET_PRODUCTS_QUERY,
      variables,
      SERVICE_NAME
    );

    const products = (data.products || []).map((p: any) => ({
      ...p,
      name: p.title || 'Unknown Product',
      sku: p.slug || p.id,
      stockQuantity: 0, // Placeholder until additionalData parsing is refined
      sellingPrice: 0,
      isActive: p.status === 'active',
    }));

    let filteredProducts = products;

    // Apply client-side filters for unsupported query parameters
    if (filters.stockStatus === 'low_stock') {
      filteredProducts = filteredProducts.filter((p: Product) => p.stockQuantity <= p.lowStockThreshold);
    }
    if (filters.stockStatus === 'out_of_stock') {
      filteredProducts = filteredProducts.filter((p: Product) => p.stockQuantity === 0);
    }
    if (filters.categoryId) {
      filteredProducts = filteredProducts.filter((p: Product) => p.categoryId === filters.categoryId);
    }

    return {
      data: filteredProducts,
      total: filteredProducts.length,
      page: filters.page || 1,
      limit: filters.limit || 50,
      totalPages: 1,
    };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return {
      data: [],
      total: 0,
      page: filters.page || 1,
      limit: filters.limit || 50,
      totalPages: 0,
    };
  }
}

/**
 * Get single product by ID
 */
export async function getProduct(id: string): Promise<Product> {
  const data = await gqlQuery<{ product: Product }>(
    queries.GET_PRODUCT_QUERY,
    { id },
    SERVICE_NAME
  );
  return data.product;
}

/**
 * Get inventory statistics
 */
export async function getInventoryStats(): Promise<InventoryStats> {
  try {
    const data = await gqlQuery<{ inventoryStats: InventoryStats }>(
      queries.GET_INVENTORY_STATS_QUERY,
      {},
      SERVICE_NAME
    );
    return data.inventoryStats;
  } catch (error) {
    console.error('Inventory stats not available in this environment:', error);
    // Return empty stats to prevent UI crash/400 error blocking
    return {
      totalProducts: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0,
      lowStockValue: 0,
      totalStock: 0,
      recentMovements: 0
    };
  }
}

/**
 * Create a new product
 */
export async function createProduct(input: CreateProductInput): Promise<Product> {
  const data = await gqlMutation<{ createProduct: Product }>(
    queries.CREATE_PRODUCT_MUTATION,
    { input },
    SERVICE_NAME
  );
  return data.createProduct;
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
  const data = await gqlMutation<{ updateProduct: Product }>(
    queries.UPDATE_PRODUCT_MUTATION,
    { id, input },
    SERVICE_NAME
  );
  return data.updateProduct;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  await gqlMutation(
    queries.DELETE_PRODUCT_MUTATION,
    { id },
    SERVICE_NAME
  );
}

/**
 * Query Keys for React Query
 */
export const inventoryGraphQLKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryGraphQLKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...inventoryGraphQLKeys.lists(), filters] as const,
  details: () => [...inventoryGraphQLKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryGraphQLKeys.details(), id] as const,
  stats: () => [...inventoryGraphQLKeys.all, 'stats'] as const,
};
