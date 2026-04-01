/** Inventory Hooks Compatibility */
import { inventoryService } from '../config';

export function useList(filters = {}, options = {}) {
  return inventoryService.usePaginatedList(filters, options);
}

export function useById(id: string, options = {}) {
  return inventoryService.useById(id, options);
}

export function useStats(options = {}) {
  return inventoryService.useStats(options);
}

// Aliases
export const useGetProducts = useList;
export const useGetProduct = useById;
export const useGetInventoryStats = useStats;