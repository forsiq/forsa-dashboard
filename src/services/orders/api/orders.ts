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
  OrderItem,
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

  // Map order items from API response
  const rawItems = (row.items ?? row.order_items ?? row.orderItems) as any[] | undefined;
  let items: OrderItem[] = Array.isArray(rawItems)
    ? rawItems.map((item: any, idx: number) => ({
        id: String(item.id ?? idx),
        productId: String(item.productId ?? item.product_id ?? item.auctionId ?? item.auction_id ?? ''),
        productName: String(item.productName ?? item.product_name ?? item.title ?? ''),
        productSku: item.productSku ?? item.product_sku ?? undefined,
        quantity: Number(item.quantity ?? 1),
        unitPrice: Number(item.unitPrice ?? item.unit_price ?? item.price ?? 0),
        totalPrice: Number(item.totalPrice ?? item.total_price ?? item.unitPrice ?? item.unit_price ?? item.price ?? 0),
      }))
    : [];

  // An auction order is one-won-auction-per-order. The backend Order entity
  // has no `items[]`; it exposes auction fields directly (auctionTitle,
  // finalPrice, imageUrl, auctionId). Synthesize a single line item so the
  // detail page / invoice shows the product instead of "no items".
  if (items.length === 0) {
    const finalPrice = Number(row.finalPrice ?? row.final_price ?? row.total ?? row.amount ?? 0);
    const auctionTitle = String(row.auctionTitle ?? row.auction_title ?? row.title ?? '').trim();
    const auctionId = String(row.auctionId ?? row.auction_id ?? '');
    const image = String(row.imageUrl ?? row.image_url ?? '').trim() || undefined;
    if (auctionTitle || finalPrice > 0 || auctionId) {
      items = [{
        id: auctionId || row.id ? String(row.id) : 'item-0',
        productId: auctionId,
        productName: auctionTitle || (row.id ? `Order #${row.id}` : 'Item'),
        productSku: undefined,
        quantity: 1,
        unitPrice: finalPrice,
        totalPrice: finalPrice,
        image,
      }];
    }
  }

  const winnerPhone = String(row.winnerPhone ?? row.winner_phone ?? '').trim();

  return {
  id: String(row.id ?? ''),
  orderNumber: `ORD-${row.id ?? ''}`,
  customerId: String(row.winnerId ?? row.winner_id ?? winnerName ?? ''),
  customerName: winnerName,
  customerEmail: '',
  customerPhone: winnerPhone,
  items,
  subtotal: Number(row.finalPrice ?? row.final_price ?? row.total ?? row.amount ?? 0),
  tax: Number(row.tax ?? 0),
  shipping: Number(row.shipping ?? row.shipping_cost ?? 0),
  discount: Number(row.discount ?? 0),
  total: Number(row.finalPrice ?? row.final_price ?? row.total ?? row.amount ?? 0),
  currency: 'IQD',
  status: apiStatus,
  paymentStatus: row.isPaid || row.is_paid ? 'paid' : 'pending',
  priority: 'medium' as const,
  notes: String(row.notes ?? ''),
  trackingNumber: String(row.trackingNumber ?? row.tracking_number ?? ''),
  deliveryProvider: String(row.deliveryProvider ?? row.delivery_provider ?? ''),
  shippingAddress: {} as any,
  billingAddress: {} as any,
  createdAt: String(row.createdAt ?? row.created_at ?? row.date ?? new Date().toISOString()),
  updatedAt: String(row.updatedAt ?? row.updated_at ?? row.createdAt ?? row.created_at ?? row.date ?? new Date().toISOString()),
  };
};

/** Map UI sort keys to auction-service order list query (avoids 400/500 on list). */
function normalizeOrderListFilters(filters: OrderFilters): OrderFilters {
  const sortByMap: Record<string, string> = {
    createdAt: 'createdAt',
    date: 'createdAt',
    orderNumber: 'createdAt',
    total: 'finalPrice',
    finalPrice: 'finalPrice',
    status: 'status',
    paidAt: 'paidAt',
  };
  const sortBy = filters.sortBy
    ? sortByMap[filters.sortBy] ?? 'createdAt'
    : undefined;
  const sortOrder = filters.sortOrder
    ? (String(filters.sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC')
    : undefined;
  return { ...filters, sortBy: sortBy as OrderFilters['sortBy'], sortOrder: sortOrder as OrderFilters['sortOrder'] };
}

export async function getOrders(filters: OrderFilters = {} as any, signal?: AbortSignal): Promise<OrdersResponse> {
  const response = await orderBaseApi.list(normalizeOrderListFilters(filters)) as any;
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
    todayOrders:
      stats.todayOrders ||
      stats.today_orders ||
      stats.thisMonthOrders ||
      stats.this_month_orders ||
      0,
    todayRevenue:
      stats.todayRevenue ||
      stats.today_revenue ||
      stats.thisMonthRevenue ||
      stats.this_month_revenue ||
      0,
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
