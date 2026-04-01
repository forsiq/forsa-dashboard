/**
 * Orders API - Compatibility Layer
 */

import { orderService } from '../config';
import type { Order, CreateOrderInput, UpdateOrderInput, OrderFilters, OrderStats } from '../types';

// Re-export API functions with original names (unwrap data property)
export async function getOrders(filters: OrderFilters = {} as any) {
  const response = await orderService.api.list(filters);
  return response.data;
}

export async function getOrder(id: string) {
  const response = await orderService.api.getById(id);
  return response.data;
}

export async function getOrderStats() {
  const response = await orderService.api.getStats();
  return response.data;
}

export async function createOrder(input: CreateOrderInput) {
  const response = await orderService.api.create(input);
  return response.data;
}

export async function updateOrder(input: UpdateOrderInput) {
  const response = await orderService.api.update(input);
  return response.data;
}

export async function updateOrderStatus(id: string, status: string) {
  return orderService.api.update({ id, status } as any);
}

export async function deleteOrder(id: string) {
  await orderService.api.delete(id);
}

// Export keys
export const orderKeys = orderService.queryKeys;
