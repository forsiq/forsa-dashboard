/** Orders API - Using REST */
import { createApiClient } from '@core/services/ApiClientFactory';
import type { 
  Order, 
  CreateOrderInput, 
  UpdateOrderInput, 
  OrderFilters, 
  OrderStats,
  OrdersResponse,
  OrderStatus,
} from '../types';
import { pickOrderWinnerName } from '../utils/order-display';

/**
 * Base Order API implementation
 */
import { API_BASE_URL } from '@config/api';

export const orderBaseApi = createApiClient<Order, CreateOrderInput, UpdateOrderInput, OrderFilters>({
  serviceName: 'orders',
  endpoint: '/orders',
  apiBaseUrl: API_BASE_URL,
});

const mapToOrder = (raw: any): Order => {
  const row = (raw ?? {}) as Record<string, unknown>;
  const winnerName = pickOrderWinnerName(row);
  const apiStatus = String(row.status ?? 'pending') as OrderStatus;

  return {
  id: String(row.id ?? ''),
  orderNumber: `ORD-${row.id ?? ''}`,
  customerId: String(row.winnerId ?? row.winner_id ?? winnerName ?? ''),
  customerName: winnerName,
  customerEmail: String(row.winnerPhone ?? row.winner_phone ?? ''),
  items: [],
  subtotal: Number(row.finalPrice ?? row.final_price ?? row.total ?? row.amount ?? 0),
  tax: 0,
  shipping: 0,
  discount: 0,
  total: Number(row.finalPrice ?? row.final_price ?? row.total ?? row.amount ?? 0),
  currency: 'IQD',
  status: apiStatus,
  paymentStatus: row.isPaid || row.is_paid ? 'paid' : 'pending',
  priority: 'medium' as const,
  notes: String(row.notes ?? ''),
  shippingAddress: {} as any,
  billingAddress: {} as any,
  createdAt: String(row.createdAt ?? row.created_at ?? row.date ?? new Date().toISOString()),
  updatedAt: String(row.updatedAt ?? row.updated_at ?? row.createdAt ?? row.created_at ?? row.date ?? new Date().toISOString()),
};
};

export async function getOrders(filters: OrderFilters = {} as any, signal?: AbortSignal): Promise<OrdersResponse> {
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
    processing:
      (stats.confirmed || 0) + (stats.paid || 0) + (stats.processing || 0),
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
