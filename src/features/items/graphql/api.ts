/**
 * Items (Product) GraphQL API Service
 * Uses 'product' service
 */

import { gqlQuery, gqlMutation } from '@core/services/GraphQLClient';
import * as queries from './queries';
import type { Item, ItemFilters, ItemStatus } from '../types';

const SERVICE_NAME = 'product';

/**
 * Map GraphQL Product to UI Item
 */
function mapProductToItem(p: any): Item {
  return {
    id: String(p.idNum || p.id),
    name: p.title || p.name || p.nameAr || 'Unknown Item',
    description: p.content || p.description || p.descriptionAr || '',
    category: p.category?.name || 'General',
    sku: p.slug || p.sku || '',
    startingBid: p.sellingPrice || 0,
    currentBid: p.sellingPrice || 0, // Fallback if no specific auction data
    image: (Array.isArray(p.images) && p.images[0]) || '📦',
    status: (p.status?.toLowerCase() || 'available') as ItemStatus,
    auctionCount: p.auctionCount || 0,
    stockQuantity: p.stockQuantity || 0,
    isWatched: false, // Local state usually
    createdAt: p.createdAt || new Date().toISOString(),
  };
}

/**
 * Get paginated list of items (products)
 */
export async function getItems(filters: ItemFilters = {}): Promise<{ items: Item[]; totalCount: number }> {
  try {
    const variables = queries.buildProductVariables(filters);
    const data = await gqlQuery<{ products: any[]; productCount: number }>(
      queries.GET_PRODUCTS_QUERY,
      variables,
      SERVICE_NAME
    );

    const products = data.products || [];
    const totalCount = data.productCount ?? products.length;

    return {
      items: products.map(mapProductToItem),
      totalCount
    };
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return { items: [], totalCount: 0 };
  }
}

/**
 * Get single item by ID
 */
export async function getItem(id: string): Promise<Item> {
  const data = await gqlQuery<{ product: any }>(
    queries.GET_PRODUCT_QUERY,
    { id: String(id) },
    SERVICE_NAME
  );
  return mapProductToItem(data.product);
}

/**
 * Create a new product
 */
export async function createProduct(input: any): Promise<Item> {
  const data = await gqlMutation<{ createProduct: any }>(
    queries.CREATE_PRODUCT_MUTATION,
    { input },
    SERVICE_NAME
  );
  return mapProductToItem(data.createProduct);
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, input: any): Promise<Item> {
  const data = await gqlMutation<{ updateProduct: any }>(
    queries.UPDATE_PRODUCT_MUTATION,
    { id: String(id), input },
    SERVICE_NAME
  );
  return mapProductToItem(data.updateProduct);
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  await gqlMutation(
    queries.DELETE_PRODUCT_MUTATION,
    { id: String(id) },
    SERVICE_NAME
  );
}

/**
 * Query Keys for React Query
 */
export const itemGraphQLKeys = {
  all: ['items'] as const,
  lists: () => [...itemGraphQLKeys.all, 'list'] as const,
  list: (filters: ItemFilters) => [...itemGraphQLKeys.lists(), filters] as const,
  details: () => [...itemGraphQLKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemGraphQLKeys.details(), id] as const,
};
