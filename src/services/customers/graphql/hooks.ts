/**
 * Customer GraphQL React Query Hooks
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import {
  getCustomers,
  getCustomer,
  getCustomerStats,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  updateCustomerStatus,
  customerKeys,
} from './api';
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerFilters,
  CustomersResponse,
  CustomerStats,
} from '../types';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch customers with filters
 *
 * @example
 * const { data, isLoading, error } = useGetCustomers({
 *   page: 1,
 *   limit: 20,
 *   status: 'active'
 * });
 */
export function useGetCustomers(
  filters: CustomerFilters = {}
): UseQueryResult<CustomersResponse> {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => getCustomers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single customer by ID
 *
 * @example
 * const { data, isLoading, error } = useGetCustomer('customer-id');
 */
export function useGetCustomer(
  id: string,
  enabled = true
): UseQueryResult<Customer> {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomer(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch customer statistics
 *
 * @example
 * const { data, isLoading, error } = useGetCustomerStats();
 */
export function useGetCustomerStats(): UseQueryResult<CustomerStats> {
  return useQuery({
    queryKey: customerKeys.stats(),
    queryFn: getCustomerStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new customer
 *
 * @example
 * const createMutation = useCreateCustomer();
 * await createMutation.mutateAsync({ name: 'John', email: 'john@example.com' });
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer(input),
    onSuccess: () => {
      // Invalidate customers list queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });
    },
  });
}

/**
 * Update an existing customer
 *
 * @example
 * const updateMutation = useUpdateCustomer();
 * await updateMutation.mutateAsync({ id: '123', name: 'Updated Name' });
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCustomerInput) => updateCustomer(input),
    onSuccess: (data, variables) => {
      // Invalidate the specific customer query
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
      // Invalidate customers list queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

/**
 * Delete a customer
 *
 * @example
 * const deleteMutation = useDeleteCustomer();
 * await deleteMutation.mutateAsync('customer-id');
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      // Invalidate customers list queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });
    },
  });
}

/**
 * Update customer status
 *
 * @example
 * const statusMutation = useUpdateCustomerStatus();
 * await statusMutation.mutateAsync({ id: '123', status: 'inactive' });
 */
export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Customer['status'] }) =>
      updateCustomerStatus(id, status),
    onSuccess: (data, variables) => {
      // Invalidate the specific customer query
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
      // Invalidate customers list queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });
    },
  });
}

// ============================================================================
// Prefetch Functions
// ============================================================================

/**
 * Prefetch customer data for faster navigation
 *
 * @example
 * const queryClient = useQueryClient();
 * prefetchCustomer(queryClient, 'customer-id');
 */
export async function prefetchCustomer(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomer(id),
    staleTime: 10 * 60 * 1000,
  });
}
