/**
 * Customer Types
 * Ready-made service types - DO NOT MODIFY unless necessary
 */

import type { ApiResponse } from '../common';

/**
 * Customer entity
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneSecondary?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  type?: 'individual' | 'business';
  businessName?: string;
  taxId?: string;
  notes?: string;
  isActive: boolean;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create customer request
 */
export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string;
  phoneSecondary?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  type?: 'individual' | 'business';
  businessName?: string;
  taxId?: string;
  notes?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

/**
 * Customer list query params
 */
export interface GetCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: 'individual' | 'business' | 'all';
  city?: string;
  country?: string;
  isActive?: boolean;
}

/**
 * Customer list response
 */
export interface GetCustomersResponse {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Customer stats
 */
export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  topCities: { city: string; count: number }[];
}

/**
 * API response types for customers
 */
export type CustomersListResponse = ApiResponse<GetCustomersResponse>;
export type CustomerDetailResponse = ApiResponse<{ customer: Customer }>;
export type CustomerStatsResponse = ApiResponse<CustomerStats>;
