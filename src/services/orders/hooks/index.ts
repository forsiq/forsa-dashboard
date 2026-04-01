/** Orders Hooks Compatibility */
import { orderService } from '../config';
import type { OrderStatus } from '../types';

export function useList(filters = {}, options = {}) {
  return orderService.usePaginatedList(filters, options);
}

export function useById(id: string, options = {}) {
  return orderService.useById(id, options);
}

export function useStats(options = {}) {
  return orderService.useStats(options);
}

export function useCreate(options = {}) {
  return orderService.useCreate(options);
}

export function useUpdate(options = {}) {
  return orderService.useUpdate(options);
}

export function useDelete(options = {}) {
  return orderService.useDelete(options);
}

// Additional compatibility functions
export async function updateOrderStatus(id: string, status: string | OrderStatus) {
  return orderService.api.update({ id, status } as any);
}

// Aliases
export const useGetOrders = useList;
export const useGetOrder = useById;
export const useGetOrderStats = useStats;