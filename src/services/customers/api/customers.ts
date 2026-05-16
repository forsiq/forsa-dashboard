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

function pickNonEmptyString(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) return c.trim();
  }
  return '';
}

/** Map list API rows (camelCase / snake_case / nested) to Customer for UI. */
export function normalizeCustomerRow(raw: Record<string, unknown>): Customer {
  const r = raw as Record<string, any>;
  const firstLast = pickNonEmptyString(
    [r.firstName, r.lastName].filter(Boolean).join(' '),
    [r.first_name, r.last_name].filter(Boolean).join(' '),
  );

  const name =
    pickNonEmptyString(
      r.name,
      r.fullName,
      r.full_name,
      r.displayName,
      r.display_name,
      firstLast,
    ) ||
    pickNonEmptyString(r.email, r.primary_email) ||
    pickNonEmptyString(r.phone, r.phone_number, r.mobile) ||
    (typeof r.id === 'string' && r.id.length > 0 ? r.id.slice(0, 12) : '') ||
    '—';

  const email = pickNonEmptyString(r.email, r.primary_email);
  const phone = pickNonEmptyString(r.phone, r.phone_number, r.mobile) || undefined;
  const statusRaw = (r.status as string) || 'active';
  const status: Customer['status'] =
    statusRaw === 'inactive' || statusRaw === 'blocked' || statusRaw === 'active' ? statusRaw : 'active';
  const type: Customer['type'] =
    r.type === 'business' || r.type === 'company' ? 'business' : 'individual';

  const createdAt = pickNonEmptyString(r.createdAt, r.created_at) || new Date().toISOString();
  const updatedAt = pickNonEmptyString(r.updatedAt, r.updated_at, r.createdAt, r.created_at) || createdAt;

  const id = String(r.id ?? r.uuid ?? '').trim();

  return {
    id: id || 'unknown',
    name,
    email,
    phone,
    avatar: pickNonEmptyString(r.avatar, r.avatar_url, r.profile_image) || undefined,
    status,
    type,
    company: pickNonEmptyString(r.company, r.company_name) || undefined,
    address: r.address,
    totalOrders: Number(r.totalOrders ?? r.total_orders ?? 0) || 0,
    totalSpent: r.totalSpent ?? r.total_spent,
    lastOrderDate: r.lastOrderDate ?? r.last_order_date,
    createdAt,
    joinDate: r.joinDate ?? r.join_date,
    updatedAt,
  };
}

/**
 * Base Customer API implementation
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.zonevast.com/forsa/api/v1';

export const customerBaseApi = createApiClient<Customer, CreateCustomerInput, UpdateCustomerInput, CustomerFilters>({
  serviceName: 'customers',
  endpoint: '/customers',
  apiBaseUrl: API_BASE_URL,
});

export async function getCustomers(filters: CustomerFilters = {} as any, signal?: AbortSignal): Promise<CustomersResponse> {
  const response = await customerBaseApi.list(filters) as any;
  const rawList = Array.isArray(response.data) ? response.data : [];
  const customers = rawList.map((row: Record<string, unknown>) => normalizeCustomerRow(row));
  const total = response.total ?? customers.length;
  
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

