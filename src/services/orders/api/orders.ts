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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.zonevast.com/forsa/api/v1';

export const orderBaseApi = createApiClient<Order, CreateOrderInput, UpdateOrderInput, OrderFilters>({
  serviceName: 'orders',
  endpoint: '/orders',
  apiBaseUrl: API_BASE_URL,
});

const mapToOrder = (raw: any): Order => ({
  id: String(raw?.id ?? ''),
  orderNumber: `ORD-${raw?.id ?? ''}`,
  customerId: raw?.winnerId || raw?.customerName || '',
  customerName: raw?.winnerName || raw?.customerName || 'Unknown',
  customerEmail: raw?.winnerPhone || '',
  items: [],
  subtotal: Number(raw?.finalPrice || raw?.total || raw?.amount || 0),
  tax: 0,
  shipping: 0,
  discount: 0,
  total: Number(raw?.finalPrice || raw?.total || raw?.amount || 0),
  currency: 'IQD',
  status: raw?.status || 'pending',
  paymentStatus: raw?.isPaid ? 'paid' : 'pending',
  priority: 'medium' as const,
  notes: raw?.notes || '',
  shippingAddress: {} as any,
  billingAddress: {} as any,
  createdAt: raw?.createdAt || raw?.date || new Date().toISOString(),
  updatedAt: raw?.updatedAt || raw?.createdAt || raw?.date || new Date().toISOString(),
});

export async function getOrders(filters: OrderFilters = {} as any): Promise<OrdersResponse> {
  const response = await orderBaseApi.list(filters) as any;
  const orders = (response.data || []).map(mapToOrder);
  
  return {
    data: orders,
    total: response.total || response.pagination?.total || orders.length,
    page: response.page || filters.page || 1,
    limit: response.limit || filters.limit || 50,
    totalPages: response.totalPages || response.pagination?.totalPages || Math.ceil((response.total || orders.length) / (filters.limit || 50)),
  };
}

export async function getOrder(id: string): Promise<Order> {
  const response = await orderBaseApi.getById(id);
  return mapToOrder(response.data);
}

export async function getOrderStats(): Promise<OrderStats> {
  const response = await orderBaseApi.getStats();
  const stats = response.data;
  return {
    total: stats.total || 0,
    pending: stats.pending || 0,
    processing: stats.confirmed || stats.processing || 0,
    shipped: stats.shipped || 0,
    delivered: stats.delivered || 0,
    cancelled: stats.cancelled || 0,
    totalRevenue: stats.totalRevenue || stats.total_revenue || 0,
    refunded: 0,
    todayOrders: stats.todayOrders || stats.today_orders || 0,
    todayRevenue: stats.todayRevenue || stats.today_revenue || 0,
    averageOrderValue: stats.averageOrderValue || stats.average_order_value || 0,
  };
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const response = await orderBaseApi.create(input);
  return mapToOrder(response.data);
}

export async function updateOrder(input: UpdateOrderInput): Promise<Order> {
  const response = await orderBaseApi.update({ ...input, id: String(input.id) } as any);
  return mapToOrder(response.data);
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const response = await orderBaseApi.getInstance().patch(`/orders/${id}/status`, { status });
  return mapToOrder(response.data.data);
}

export async function updateOrderPaymentStatus(id: string, isPaid: boolean, notes?: string): Promise<Order> {
  const response = await orderBaseApi.getInstance().patch(`/orders/${id}/payment-status`, { isPaid, notes });
  return mapToOrder(response.data.data);
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
