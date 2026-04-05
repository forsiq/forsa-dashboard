/**
 * Orders GraphQL API Service
 * Uses 'order' service
 */

import { gqlQuery, gqlMutation } from '@core/services/GraphQLClient';
import * as Queries from './queries';
import type { Order, OrderFilters, OrderStats, CreateOrderInput, UpdateOrderInput, OrdersResponse } from '../types';

const SERVICE_NAME = 'order';

/**
 * Map GraphQL Order to UI Order
 */
function mapOrderFromGraphQL(o: any): Order {
  const customerName = o.customer 
    ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() 
    : 'Unknown Customer';
  const customerEmail = o.customer?.email || '';

  return {
    ...o,
    customerName,
    customerEmail,
    items: (o.items || []).map((item: any) => ({
      ...item,
      totalPrice: item.totalPrice || (item.quantity * item.unitPrice)
    })),
    createdAt: o.createdAt || new Date().toISOString(),
    updatedAt: o.updatedAt || new Date().toISOString(),
    shippingAddress: o.shippingAddress || {},
    billingAddress: o.billingAddress || {},
  } as Order;
}

/**
 * Get paginated list of orders
 */
export async function getOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
  const variables = Queries.buildOrderVariables(filters);
  const data = await gqlQuery<{ orders: any[]; orderCount: number }>(
    Queries.GET_ORDERS_QUERY,
    variables,
    SERVICE_NAME
  );

  const mappedOrders = (data.orders || []).map(mapOrderFromGraphQL);
  const total = data.orderCount || mappedOrders.length;
  const limit = filters.limit || 50;
  const page = filters.page || 1;

  return {
    data: mappedOrders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Get single order by ID
 */
export async function getOrder(id: string): Promise<Order> {
  const data = await gqlQuery<{ order: any }>(
    Queries.GET_ORDER_QUERY,
    { id },
    SERVICE_NAME
  );
  return mapOrderFromGraphQL(data.order);
}

/**
 * Get order statistics
 */
export async function getOrderStats(): Promise<OrderStats> {
  const data = await gqlQuery<{ orderStats: OrderStats }>(
    Queries.GET_ORDER_STATS_QUERY,
    {},
    SERVICE_NAME
  );
  return data.orderStats;
}

/**
 * Create a new order
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const data = await gqlMutation<{ createOrder: any }>(
    Queries.CREATE_ORDER_MUTATION,
    { input },
    SERVICE_NAME
  );
  return mapOrderFromGraphQL(data.createOrder);
}

/**
 * Update an existing order
 */
export async function updateOrder(id: string, input: UpdateOrderInput): Promise<Order> {
  const data = await gqlMutation<{ updateOrder: any }>(
    Queries.UPDATE_ORDER_MUTATION,
    { id, input },
    SERVICE_NAME
  );
  return mapOrderFromGraphQL(data.updateOrder);
}

/**
 * Query Keys for React Query Cache
 */
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
};
