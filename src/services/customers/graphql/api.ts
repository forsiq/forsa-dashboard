/**
 * Customer GraphQL API Functions
 */

import { gqlQuery, gqlMutation } from '@core/services/GraphQLClient';
import {
  GET_CUSTOMERS_QUERY,
  GET_CUSTOMER_QUERY,
  GET_CUSTOMER_STATS_QUERY,
  CREATE_CUSTOMER_MUTATION,
  UPDATE_CUSTOMER_MUTATION,
  DELETE_CUSTOMER_MUTATION,
  UPDATE_CUSTOMER_STATUS_MUTATION,
  buildCustomerVariables,
} from './queries';
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerFilters,
  CustomersResponse,
  CustomerStats,
} from '../types';

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get paginated list of customers
 */
export async function getCustomers(
  filters: CustomerFilters = {}
): Promise<CustomersResponse> {
  try {
    const variables = buildCustomerVariables(filters);

    const data = await gqlQuery<{
      customers: Customer[];
    }>(GET_CUSTOMERS_QUERY, variables, 'customer');

    const customers = data.customers || [];
    const total = customers.length; // Fallback since customerCount is unavailable

    return {
      customers,
      total,
      page: filters.page || 1,
      limit: filters.limit || 50,
      totalPages: Math.ceil(total / (filters.limit || 50)),
    };
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return {
      customers: [],
      total: 0,
      page: filters.page || 1,
      limit: filters.limit || 50,
      totalPages: 0,
    };
  }
}

/**
 * Get a single customer by ID
 */
export async function getCustomer(id: string): Promise<Customer> {
  const data = await gqlQuery<{ customer: Customer }>(
    GET_CUSTOMER_QUERY,
    { id },
    'customer'
  );
  return data.customer;
}

/**
 * Get customer statistics
 */
export async function getCustomerStats(): Promise<CustomerStats> {
  try {
    const data = await gqlQuery<{ customerStats: CustomerStats }>(
      GET_CUSTOMER_STATS_QUERY,
      {},
      'customer'
    );
    return data.customerStats;
  } catch (error) {
    console.error('Customer stats not available in this environment:', error);
    // Return empty stats to prevent UI crash/400 error blocking
    return {
      total: 0,
      active: 0,
      inactive: 0,
      blocked: 0,
      newThisMonth: 0,
      topSpenders: []
    };
  }
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new customer
 */
export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const data = await gqlMutation<{ createCustomer: Customer }>(
    CREATE_CUSTOMER_MUTATION,
    { input },
    'customer'
  );
  return data.createCustomer;
}

/**
 * Update an existing customer
 */
export async function updateCustomer(input: UpdateCustomerInput): Promise<Customer> {
  const { id, ...data } = input;
  const result = await gqlMutation<{ updateCustomer: Customer }>(
    UPDATE_CUSTOMER_MUTATION,
    { id, input: data },
    'customer'
  );
  return result.updateCustomer;
}

/**
 * Delete a customer
 */
export async function deleteCustomer(id: string): Promise<{ success: boolean; message: string }> {
  const data = await gqlMutation<{ deleteCustomer: { success: boolean; message: string } }>(
    DELETE_CUSTOMER_MUTATION,
    { id },
    'customer'
  );
  return data.deleteCustomer;
}

/**
 * Update customer status
 */
export async function updateCustomerStatus(
  id: string,
  status: Customer['status']
): Promise<Customer> {
  const data = await gqlMutation<{ updateCustomerStatus: Customer }>(
    UPDATE_CUSTOMER_STATUS_MUTATION,
    { id, status },
    'customer'
  );
  return data.updateCustomerStatus;
}

// ============================================================================
// Query Keys for React Query Cache
// ============================================================================

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: CustomerFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  stats: () => [...customerKeys.all, 'stats'] as const,
} as const;
