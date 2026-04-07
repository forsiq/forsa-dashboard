/**
 * Customer GraphQL React Query Hooks
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { useToast } from '@core/contexts/ToastContext';
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
 * Hook to show error toast only once per unique error
 */
function useErrorHandler(error: Error | null, messagePrefix: string) {
  const toast = useToast();
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (error) {
      const errorKey = `${messagePrefix}:${error.message}`;
      // Only show toast if this is a new error
      if (lastErrorRef.current !== errorKey) {
        lastErrorRef.current = errorKey;
        toast.error(`${messagePrefix}: ${error.message}`, 8000);
      }
    } else {
      // Reset when no error
      lastErrorRef.current = null;
    }
  }, [error, messagePrefix, toast]);
}

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
  const query = useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => getCustomers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useErrorHandler(query.error, 'Failed to load customers');

  return query;
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
  const query = useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomer(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useErrorHandler(query.error, 'Failed to load customer');

  return query;
}

/**
 * Fetch customer statistics
 *
 * @example
 * const { data, isLoading, error } = useGetCustomerStats();
 */
export function useGetCustomerStats(): UseQueryResult<CustomerStats> {
  const query = useQuery({
    queryKey: customerKeys.stats(),
    queryFn: getCustomerStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useErrorHandler(query.error, 'Failed to load customer stats');

  return query;
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
  const toast = useToast();

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer(input),
    onSuccess: () => {
      // Invalidate customers list queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });
      toast.success('Customer created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create customer: ${error.message}`, 8000);
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
  const toast = useToast();

  return useMutation({
    mutationFn: (input: UpdateCustomerInput) => updateCustomer(input),
    onSuccess: (data, variables) => {
      // Invalidate the specific customer query
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
      // Invalidate customers list queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success('Customer updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update customer: ${error.message}`, 8000);
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
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      // Invalidate customers list queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });
      toast.success('Customer deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete customer: ${error.message}`, 8000);
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
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Customer['status'] }) =>
      updateCustomerStatus(id, status),
    onSuccess: (data, variables) => {
      // Invalidate the specific customer query
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
      // Invalidate customers list queries
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });
      toast.success('Customer status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update customer status: ${error.message}`, 8000);
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
