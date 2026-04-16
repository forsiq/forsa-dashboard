/** Items (Products) API - Using REST */
import { createApiClient } from '@core/services/ApiClientFactory';
import { resolveItemDisplayImage } from '@core/utils/devPhotoFallback';
import type { 
  Item, 
  ItemFilters, 
  ItemStatus 
} from '../types';

/**
 * Base Item API implementation
 */
export const itemBaseApi = createApiClient<Item, any, any, ItemFilters>({
  serviceName: 'items',
  endpoint: '/items',
});

function mapProductToItem(p: any): Item {
  const rawImage = (Array.isArray(p.images) && p.images[0]) || p.image || '📦';
  const image = resolveItemDisplayImage(p as Record<string, unknown>, String(rawImage));
  return {
    id: String(p.idnum || p.id),
    name: p.title || p.name || 'Unknown Item',
    description: p.content || p.description || '',
    category: p.category?.name || 'General',
    sku: p.slug || p.sku || '',
    startingBid: p.selling_price || 0,
    currentBid: p.current_bid || p.selling_price || 0,
    image,
    status: (p.status?.toLowerCase() || 'available') as ItemStatus,
    auctionCount: p.auction_count || 0,
    stockQuantity: p.stock_quantity || 0,
    isWatched: false,
    createdAt: p.created_at || new Date().toISOString(),
  };
}

export async function getItems(filters: ItemFilters = {} as any): Promise<{ items: Item[]; totalCount: number }> {
  try {
    const response = await itemBaseApi.list(filters) as any;
    const products = response.data || [];
    const totalCount = response.total ?? products.length;

    return {
      items: products.map(mapProductToItem),
      totalCount
    };
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return { items: [], totalCount: 0 };
  }
}

export async function getItem(id: string): Promise<Item> {
  const response = await itemBaseApi.getById(id);
  return mapProductToItem(response.data);
}

export async function createProduct(input: any): Promise<Item> {
  const response = await itemBaseApi.create(input);
  return mapProductToItem(response.data);
}

export async function updateProduct(id: string, input: any): Promise<Item> {
  const response = await itemBaseApi.update({ ...input, id });
  return mapProductToItem(response.data);
}

export async function deleteProduct(id: string): Promise<void> {
  await itemBaseApi.delete(id);
}

export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (filters: ItemFilters) => [...itemKeys.lists(), filters] as const,
  details: () => [...itemKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemKeys.details(), id] as const,
};
