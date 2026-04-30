/** Customers Hooks - Using CrudServiceFactory + custom hooks */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/customers';
import type { Customer, CreateCustomerInput, UpdateCustomerInput, CustomerFilters, CustomersResponse } from '../types';

export const customerKeys = api.customerKeys;

export const useGetCustomers = (filters: CustomerFilters = {} as any) => {
  return useQuery<CustomersResponse>({
    queryKey: api.customerKeys.list(filters),
    queryFn: () => api.getCustomers(filters),
  });
};

export const useGetCustomer = (id: string, enabledOrOptions?: boolean | { enabled?: boolean }) => {
  const enabled = typeof enabledOrOptions === 'boolean' ? enabledOrOptions : enabledOrOptions?.enabled ?? true;
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

export const useGetCustomerBids = (id: string, page = 1, limit = 20) => {
  return useQuery<import('../types').CustomerBidsResponse>({
    queryKey: api.customerKeys.bids(id),
    queryFn: () => api.getCustomerBids(id, page, limit),
    enabled: !!id,
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
