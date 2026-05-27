/** Customers Hooks - Using CrudServiceFactory + custom hooks */
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useToast } from '@core/contexts/ToastContext';
import { useLanguage } from '@core/contexts/LanguageContext';
import * as api from '../api/customers';
import type { Customer, CreateCustomerInput, UpdateCustomerInput, CustomerFilters, CustomersResponse } from '../types';

export const customerKeys = api.customerKeys;

export const useGetCustomers = (filters: CustomerFilters = {} as any) => {
  return useQuery<CustomersResponse>({
    queryKey: api.customerKeys.list(filters),
    queryFn: () => api.getCustomers(filters),
    placeholderData: keepPreviousData,
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
  const toast = useToast();
  const { t } = useLanguage();
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => api.createCustomer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.customerKeys.all });
      toast.success(t('toast.customer.created'));
    },
    onError: (error: any) => {
      const detail = error?.message || t('toast.unknown_error');
      toast.error(t('toast.customer.create_failed', { detail }), 6000);
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useLanguage();
  return useMutation({
    mutationFn: (input: UpdateCustomerInput) => api.updateCustomer(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.customerKeys.detail(String(data.id)) });
      queryClient.invalidateQueries({ queryKey: api.customerKeys.all });
      toast.success(t('toast.customer.updated'));
    },
    onError: (error: any) => {
      const detail = error?.message || t('toast.unknown_error');
      toast.error(t('toast.customer.update_failed', { detail }), 6000);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useLanguage();
  return useMutation({
    mutationFn: (id: string) => api.deleteCustomer(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: api.customerKeys.all });
      const previousData = queryClient.getQueriesData<CustomersResponse>({ queryKey: api.customerKeys.all });
      queryClient.setQueriesData<CustomersResponse>({ queryKey: api.customerKeys.all }, (old) => {
        if (!old) return old;
        return {
          ...old,
          customers: old.customers.filter((customer) => String(customer.id) !== String(id)),
          total: Math.max(0, old.total - 1),
        };
      });
      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error(t('toast.customer.delete_failed'), 6000);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.customerKeys.all });
      toast.success(t('toast.customer.deleted'));
    },
  });
};

export const useUpdateCustomerStatus = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useLanguage();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Customer['status'] }) =>
      api.updateCustomerStatus(id, status),
    onSuccess: (data: Customer) => {
      queryClient.invalidateQueries({ queryKey: api.customerKeys.detail(String(data.id)) });
      queryClient.invalidateQueries({ queryKey: api.customerKeys.all });
      toast.success(t('toast.customer.status_updated'));
    },
    onError: (error: any) => {
      const detail = error?.message || t('toast.unknown_error');
      toast.error(t('toast.customer.status_update_failed', { detail }), 6000);
    },
  });
};

export const prefetchCustomer = async (queryClient: any, id: string) => {
  await queryClient.prefetchQuery({
    queryKey: api.customerKeys.detail(id),
    queryFn: () => api.getCustomer(id),
  });
};

export const useCreateCustomerMutation = useCreateCustomer;
export const useUpdateCustomerMutation = useUpdateCustomer;
export const useDeleteCustomerMutation = useDeleteCustomer;
