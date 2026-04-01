import axios from 'axios';
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerFilters,
  CustomersResponse,
  CustomerStats,
} from '../types';

// --- API Client ---

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const CUSTOMER_ENDPOINT = `${API_BASE_URL}/api/v1/customers`;

const customerClient = axios.create({
  baseURL: CUSTOMER_ENDPOINT,
  headers: { 'Content-Type': 'application/json' },
});

customerClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- API Functions ---

export async function getCustomers(
  filters: CustomerFilters = {}
): Promise<CustomersResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  params.append('page', String(filters.page || 1));
  params.append('limit', String(filters.limit || 50));

  const response = await customerClient.get(`/?${params}`);
  return response.data;
}

export async function getCustomer(id: string): Promise<Customer> {
  const response = await customerClient.get(`/${id}`);
  return response.data;
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  const response = await customerClient.post('/', input);
  return response.data;
}

export async function updateCustomer(input: UpdateCustomerInput): Promise<Customer> {
  const { id, ...data } = input;
  const response = await customerClient.patch(`/${id}`, data);
  return response.data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await customerClient.delete(`/${id}`);
}

export async function getCustomerStats(): Promise<CustomerStats> {
  const response = await customerClient.get('/stats');
  return response.data;
}

// --- Query Keys ---

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters: CustomerFilters) => [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  stats: () => [...customerKeys.all, 'stats'] as const,
};
