/** Orders Hooks - Using CrudServiceFactory + custom hooks */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/orders';
import type { OrderFilters, OrdersResponse } from '../types';

export const orderKeys = api.orderKeys;

export const useList = (filters: OrderFilters = {} as any) => {
  return useQuery<OrdersResponse>({
    queryKey: api.orderKeys.list(filters),
    queryFn: () => api.getOrders(filters),
  });
};

export const useById = (id: string, enabledOrOptions?: boolean | { enabled?: boolean }) => {
  const enabled = typeof enabledOrOptions === 'boolean' ? enabledOrOptions : enabledOrOptions?.enabled ?? true;
  return useQuery({
    queryKey: api.orderKeys.detail(id),
    queryFn: () => api.getOrder(id),
    enabled: enabled && !!id,
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: api.orderKeys.stats(),
    queryFn: api.getOrderStats,
  });
};

export const useCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => api.createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.orderKeys.all });
    },
  });
};

export const useUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => api.updateOrder(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.orderKeys.detail(String(data.id)) });
      queryClient.invalidateQueries({ queryKey: api.orderKeys.all });
    },
  });
};

export const useDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.orderKeys.all });
    },
  });
};

// Aliases for existing code
export const useGetOrders = useList;
export const useGetOrder = useById;
export const useGetOrderStats = useStats;
export const useCreateOrder = useCreate;
export const useUpdateOrder = useUpdate;
