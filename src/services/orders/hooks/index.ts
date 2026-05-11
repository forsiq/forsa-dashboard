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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: api.orderKeys.all });
      const previousData = queryClient.getQueriesData<OrdersResponse>({ queryKey: api.orderKeys.all });
      queryClient.setQueriesData<OrdersResponse>({ queryKey: api.orderKeys.all }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((order) => String(order.id) !== String(id)),
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.orderKeys.all });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateOrderStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: api.orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: api.orderKeys.all });
      queryClient.invalidateQueries({ queryKey: api.orderKeys.stats() });
    },
  });
};

export const useUpdateOrderPaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPaid, notes }: { id: string; isPaid: boolean; notes?: string }) =>
      api.updateOrderPaymentStatus(id, isPaid, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: api.orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: api.orderKeys.all });
      queryClient.invalidateQueries({ queryKey: api.orderKeys.stats() });
    },
  });
};

// Aliases for existing code
export const useGetOrders = useList;
export const useGetOrder = useById;
export const useGetOrderStats = useStats;
export const useCreateOrder = useCreate;
export const useUpdateOrder = useUpdate;
