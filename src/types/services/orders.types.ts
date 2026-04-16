/**
 * Order Types
 * Ready-made service types - DO NOT MODIFY unless necessary
 */

import type { ApiResponse } from '../common';

/**
 * Order status enum
 */
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

/**
 * Order entity
 */
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string;
  internalNotes?: string;
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
  items: OrderItem[];
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'failed';
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

/**
 * Order item
 */
export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  price: number;
  discount?: number;
  tax?: number;
  total: number;
  notes?: string;
  createdAt: string;
}

/**
 * Order address
 */
export interface OrderAddress {
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

/**
 * Create order request
 */
export interface CreateOrderRequest {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    price?: number;
  }[];
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  currency?: string;
  notes?: string;
}

/**
 * Update order request
 */
export interface UpdateOrderRequest {
  status?: OrderStatus;
  notes?: string;
  internalNotes?: string;
  paymentStatus?: 'pending' | 'paid' | 'partial' | 'failed';
}

/**
 * Order list query params
 */
export interface GetOrdersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: OrderStatus | 'all';
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Order list response
 */
export interface GetOrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Order stats
 */
export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  statusCounts: Record<OrderStatus, number>;
}

/**
 * API response types for orders
 */
export type OrdersListResponse = ApiResponse<GetOrdersResponse>;
export type OrderDetailResponse = ApiResponse<{ order: Order }>;
export type OrderStatsResponse = ApiResponse<OrderStats>;
