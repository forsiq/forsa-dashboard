/** Customers API - Using REST */
import { createApiClient } from '@core/services/ApiClientFactory';
import type { 
  Customer, 
  CreateCustomerInput, 
  UpdateCustomerInput, 
  CustomerFilters, 
  CustomerStats,
  CustomersResponse 
} from '../types';

/**
 * Base Customer API implementation
 */
export const customerBaseApi = createApiClient<Customer, CreateCustomerInput, UpdateCustomerInput, CustomerFilters>({
  serviceName: 'customers',
  endpoint: '/customers',
});

export async function getCustomers(filters: CustomerFilters = {} as any): Promise<CustomersResponse> {
  const response = await customerBaseApi.list(filters) as any;
  const customers = response.data || [];
  const total = response.total || customers.length;
  
  return {
    customers,
    total,
    page: filters.page || 1,
    limit: filters.limit || 50,
    totalPages: Math.ceil(total / (filters.limit || 50)),
  };
}

export async function getCustomer(id: string): Promise<Customer> {
  const response = await customerBaseApi.getById(id);
  return response.data;
}

export async function getCustomerStats(): Promise<CustomerStats> {
  const response = await customerBaseApi.getStats();
  const stats = response.data;
  return {
    total: stats.total || 0,
    active: stats.active || 0,
    inactive: stats.inactive || 0,
    blocked: stats.blocked || 0,
    newThisMonth: stats.new_this_month || 0,
    topSpenders: (stats.top_spenders as any) || [],

  };
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const response = await customerBaseApi.create(input);
  return response.data;
}

export async function updateCustomer(input: UpdateCustomerInput): Promise<Customer> {
  const response = await customerBaseApi.update({ ...input, id: String(input.id) });
  return response.data;
}

export async function deleteCustomer(id: string): Promise<{ success: boolean; message: string }> {
  await customerBaseApi.delete(id);
  return { success: true, message: 'Customer deleted successfully' };
}

export async function updateCustomerStatus(id: string, status: Customer['status']): Promise<Customer> {
  const response = await customerBaseApi.getInstance().patch(`/customers/${id}/status/`, { status });
  return response.data.data;
}

export async function getCustomerBids(
  id: string,
  page = 1,
  limit = 20,
): Promise<import('../types').CustomerBidsResponse> {
  const response = await customerBaseApi.getInstance().get(`/customers/${id}/bids`, {
    params: { page, limit },
  });
  return response.data;
}

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: CustomerFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  stats: () => [...customerKeys.all, 'stats'] as const,
  bids: (id: string) => [...customerKeys.detail(id), 'bids'] as const,
};

