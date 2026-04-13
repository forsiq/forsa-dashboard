/** Customers Hooks - Using REST */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/customers';
import type { CreateCustomerInput, UpdateCustomerInput, CustomerFilters, Customer } from '../types';

export const useGetCustomers = (filters: CustomerFilters = {} as any) => {
  return useQuery({
    queryKey: api.customerKeys.list(filters),
    queryFn: () => api.getCustomers(filters),
  });
};

export const useGetCustomer = (id: string, enabled = true) => {
  return useQuery({
    queryKey: api.customerKeys.detail(id),
    queryFn: () => api.getCustomer(id),
    enabled: enabled && !!id,
  });
};

export const useGetCustomerStats = () => {
  return useQuery({
    queryKey: api.customerKeys.stats(),
    queryFn: api.getCustomerStats,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => api.createCustomer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.customerKeys.all });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCustomerInput) => api.updateCustomer(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.customerKeys.detail(String(data.id)) });
      queryClient.invalidateQueries({ queryKey: api.customerKeys.all });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.customerKeys.all });
    },
  });
};

export const useUpdateCustomerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Customer['status'] }) => 
      api.updateCustomerStatus(id, status),
    onSuccess: (data: Customer) => {
      queryClient.invalidateQueries({ queryKey: api.customerKeys.detail(String(data.id)) });
      queryClient.invalidateQueries({ queryKey: api.customerKeys.all });
    },
  });
};

// Prefetch for optimization
export const prefetchCustomer = async (queryClient: any, id: string) => {
  await queryClient.prefetchQuery({
    queryKey: api.customerKeys.detail(id),
    queryFn: () => api.getCustomer(id),
  });
};

// Compatibility aliases
export const useCreateCustomerMutation = useCreateCustomer;
export const useUpdateCustomerMutation = useUpdateCustomer;
export const useDeleteCustomerMutation = useDeleteCustomer;

// Re-export query keys
export const { customerKeys } = api;

