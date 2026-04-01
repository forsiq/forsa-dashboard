import axios from 'axios';
import type {
  Order,
  CreateOrderInput,
  UpdateOrderInput,
  OrderFilters,
  OrdersResponse,
  OrderStats,
} from '../types';

// --- API Client Configuration ---

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_VERSION = 'v1';
const ORDER_ENDPOINT = `${API_BASE_URL}/api/${API_VERSION}/orders`;

// Create axios instance for orders
const orderClient = axios.create({
  baseURL: ORDER_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
orderClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
orderClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({
      message,
      code: error.response?.data?.code,
      status: error.response?.status,
      details: error.response?.data?.details,
    });
  }
);

// --- API Functions ---

/**
 * Fetch orders with optional filters
 */
export async function getOrders(
  filters: OrderFilters = {}
): Promise<OrdersResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.paymentStatus && filters.paymentStatus !== 'all') params.append('payment_status', filters.paymentStatus);
  if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
  if (filters.customerId) params.append('customer_id', filters.customerId);
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  params.append('page', String(filters.page || 1));
  params.append('limit', String(filters.limit || 50));
  if (filters.sortBy) params.append('sort_by', filters.sortBy);
  if (filters.sortOrder) params.append('sort_order', filters.sortOrder);

  const response = await orderClient.get(`/?${params.toString()}`);
  return response.data;
}

/**
 * Fetch a single order by ID
 */
export async function getOrder(id: string): Promise<Order> {
  const response = await orderClient.get(`/${id}`);
  return response.data;
}

/**
 * Create a new order
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const response = await orderClient.post('/', input);
  return response.data;
}

/**
 * Update an existing order
 */
export async function updateOrder(input: UpdateOrderInput): Promise<Order> {
  const { id, ...data } = input;
  const response = await orderClient.patch(`/${id}`, data);
  return response.data;
}

/**
 * Delete an order
 */
export async function deleteOrder(id: string): Promise<void> {
  await orderClient.delete(`/${id}`);
}

/**
 * Get order statistics
 */
export async function getOrderStats(): Promise<OrderStats> {
  const response = await orderClient.get('/stats');
  return response.data;
}

/**
 * Update order status
 */
export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
  const response = await orderClient.patch(`/${id}/status`, { status });
  return response.data;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(id: string, paymentStatus: Order['paymentStatus']): Promise<Order> {
  const response = await orderClient.patch(`/${id}/payment-status`, { payment_status: paymentStatus });
  return response.data;
}

// --- Order Keys for Query Cache Management ---

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
} as const;
