/** Inventory API Compatibility */
import { inventoryService } from '../config';
import type { Product, CreateProductInput, UpdateProductInput, ProductFilters } from '../types';

// Use InventoryStats from types
export type { InventoryStats as ProductStats } from '../types';

export async function getProducts(filters: ProductFilters = {} as any) {
  const response = await inventoryService.api.list(filters);
  return response.data;
}

export async function getProduct(id: string) {
  const response = await inventoryService.api.getById(id);
  return response.data;
}

export async function getInventoryStats() {
  const response = await inventoryService.api.getStats();
  return response.data;
}

export async function getStats() {
  return getInventoryStats();
}

export async function createProduct(input: CreateProductInput) {
  const response = await inventoryService.api.create(input);
  return response.data;
}

export async function updateProduct(input: UpdateProductInput) {
  const response = await inventoryService.api.update(input);
  return response.data;
}

export async function deleteProduct(id: string) {
  await inventoryService.api.delete(id);
}

export const inventoryKeys = inventoryService.queryKeys;