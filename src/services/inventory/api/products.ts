/** Inventory API - Using REST, aligned with backend WarehouseItem entity */
import { createApiClient } from '@core/services/ApiClientFactory';
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  InventoryStats,
  ProductsResponse,
} from '../types';

import { API_BASE_URL } from '@config/api';

/**
 * Base Inventory API implementation
 */
export const inventoryBaseApi = createApiClient<Product, CreateProductInput, UpdateProductInput, ProductFilters>({
  serviceName: 'inventory',
  endpoint: '/inventory',
  apiBaseUrl: API_BASE_URL,
});

/**
 * Normalise a raw backend item into the frontend Product shape.
 * Handles both the new WarehouseItem response and legacy compat fields.
 */
function normalizeItem(raw: any): Product {
  const row = raw ?? {};
  const listing = row.listing ?? null;
  return {
    id: String(row.id ?? ''),
    listingId: Number(row.listingId ?? row.listing_id ?? 0),
    listing: listing
      ? {
          id: Number(listing.id ?? row.listingId ?? 0),
          title: listing.title ?? row.title ?? row.name ?? '',
          description: listing.description ?? row.description,
          categoryId: listing.categoryId ?? listing.category_id ?? row.categoryId,
          brand: listing.brand ?? row.brand,
          model: listing.model,
          sku: listing.sku ?? row.sku,
          barcode: listing.barcode ?? row.barcode,
          imageUrl: listing.imageUrl ?? listing.image_url ?? row.imageUrl ?? row.image_url ?? row.image,
          images: listing.images ?? row.images,
          mainAttachmentId: listing.mainAttachmentId ?? listing.main_attachment_id ?? row.mainAttachmentId,
          attachmentIds: listing.attachmentIds ?? listing.attachment_ids ?? row.attachmentIds,
        }
      : null,
    sku: String(row.sku ?? ''),
    barcode: row.barcode ?? undefined,
    costPrice: Number(row.costPrice ?? row.cost_price ?? row.cost ?? 0),
    sellingPrice: Number(row.sellingPrice ?? row.selling_price ?? row.price ?? 0),
    currency: String(row.currency ?? 'IQD'),
    unit: String(row.unit ?? 'piece'),
    stockQuantity: Number(row.stockQuantity ?? row.stock_quantity ?? row.quantity ?? row.stock ?? 0),
    lowStockThreshold: Number(row.lowStockThreshold ?? row.low_stock_threshold ?? row.minStock ?? row.min_stock ?? 5),
    stockStatus: (row.stockStatus ?? row.stock_status ?? 'in_stock') as Product['stockStatus'],
    isActive: row.isActive ?? row.is_active ?? true,
    notes: row.notes ?? undefined,
    metadata: row.metadata ?? {},
    movements: row.movements ?? undefined,
    createdAt: row.createdAt ?? row.created_at ?? row.lastUpdated ?? new Date().toISOString(),
    updatedAt: row.updatedAt ?? row.updated_at ?? row.lastUpdated ?? new Date().toISOString(),
  };
}

export async function getProducts(
  filters: ProductFilters = {} as any,
  signal?: AbortSignal,
): Promise<ProductsResponse> {
  // Note: the underlying API client does not support an AbortSignal; kept for
  // call-site compatibility (e.g. react-query prefetch). Safe to ignore.
  void signal;
  const response = (await inventoryBaseApi.list(filters)) as any;
  const rawItems: any[] = response.items ?? response.data ?? [];
  const products = rawItems.map(normalizeItem);

  return {
    data: products,
    total: response.total ?? products.length,
    page: Number(response.page ?? filters.page ?? 1),
    limit: Number(response.limit ?? filters.limit ?? 50),
    totalPages:
      response.totalPages ??
      Math.ceil((response.total ?? products.length) / (filters.limit ?? 50)),
  };
}

export async function getProduct(id: string): Promise<Product> {
  const response = (await inventoryBaseApi.getById(id)) as any;
  const row = response.data ?? response;
  return normalizeItem(row);
}

export async function getInventoryStats(): Promise<InventoryStats> {
  const response = (await inventoryBaseApi.getStats()) as any;
  const stats = response.data ?? response;
  return {
    totalItems: stats.totalItems ?? stats.total_products ?? 0,
    totalProducts: stats.totalProducts ?? stats.total_products ?? 0,
    inStock: stats.inStock ?? stats.in_stock ?? 0,
    lowStock: stats.lowStock ?? stats.low_stock ?? 0,
    outOfStock: stats.outOfStock ?? stats.out_of_stock ?? 0,
    totalValue: stats.totalValue ?? stats.total_value ?? 0,
    lowStockValue: stats.lowStockValue ?? stats.low_stock_value ?? 0,
    totalStock: stats.totalStock ?? stats.total_stock ?? 0,
    recentMovements: stats.recentMovements ?? stats.recent_movements ?? 0,
  };
}

export async function getStats() {
  return getInventoryStats();
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const response = (await inventoryBaseApi.create(input)) as any;
  const row = response.data ?? response;
  return normalizeItem(row);
}

export async function updateProduct(input: UpdateProductInput): Promise<Product> {
  const response = (await inventoryBaseApi.update({ ...input, id: String(input.id) } as any)) as any;
  const row = response.data ?? response;
  return normalizeItem(row);
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
