/** Orders API - Using REST */
import { createApiClient } from '@core/services/ApiClientFactory';
import type { 
  Order, 
  CreateOrderInput, 
  UpdateOrderInput, 
  OrderFilters, 
  OrderStats,
  OrdersResponse 
} from '../types';

/**
 * Base Order API implementation
 */
export const orderBaseApi = createApiClient<Order, CreateOrderInput, UpdateOrderInput, OrderFilters>({
  serviceName: 'orders',
  endpoint: '/orders',
});

export async function getOrders(filters: OrderFilters = {} as any): Promise<OrdersResponse> {
  const response = await orderBaseApi.list(filters) as any;
  const orders = response.data || [];
  
  return {
    data: orders,
    total: response.total || orders.length,
    page: filters.page || 1,
    limit: filters.limit || 50,
    totalPages: Math.ceil((response.total || orders.length) / (filters.limit || 50)),
  };
}

export async function getOrder(id: string): Promise<Order> {
  const response = await orderBaseApi.getById(id);
  return response.data;
}

export async function getOrderStats(): Promise<OrderStats> {
  const response = await orderBaseApi.getStats();
  const stats = response.data;
  return {
    total: stats.total || 0,
    pending: stats.pending || 0,
    processing: stats.processing || 0,
    shipped: stats.shipped || 0,
    delivered: stats.delivered || 0,
    cancelled: stats.cancelled || 0,
    totalRevenue: stats.total_revenue || 0,
    refunded: stats.refunded || 0,
    todayOrders: stats.today_orders || 0,
    todayRevenue: stats.today_revenue || 0,
    averageOrderValue: stats.average_order_value || 0,
  };
}


export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const response = await orderBaseApi.create(input);
  return response.data;
}

export async function updateOrder(input: UpdateOrderInput): Promise<Order> {
  const response = await orderBaseApi.update({ ...input, id: String(input.id) } as any);
  return response.data;
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const response = await orderBaseApi.getInstance().patch(`/orders/${id}/status/`, { status });
  return response.data.data;
}

export async function deleteOrder(id: string): Promise<void> {
  await orderBaseApi.delete(id);
}

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
};

