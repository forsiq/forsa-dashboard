/**
 * Order GraphQL React Query Hooks
 * Uses 'order' service
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import type { OrderFilters, CreateOrderInput, UpdateOrderInput } from '../types';

/**
 * useGetOrders - Fetch list of orders with filters
 */
export const useGetOrders = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: api.orderKeys.list(filters || {}),
    queryFn: () => api.getOrders(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * useGetOrder - Fetch single order by ID
 */
export const useGetOrder = (id: string) => {
  return useQuery({
    queryKey: api.orderKeys.detail(id),
    queryFn: () => api.getOrder(id),
    enabled: !!id,
  });
};

/**
 * useGetOrderStats - Fetch order statistics
 */
export const useGetOrderStats = () => {
  return useQuery({
    queryKey: api.orderKeys.stats(),
    queryFn: () => api.getOrderStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * useCreateOrder - Create a new order
 */
export const useCreateOrder = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateOrderInput) => api.createOrder(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.orderKeys.stats() });
      if ((options as any).onSuccess) (options as any).onSuccess(data);
    },
  });
};

/**
 * useUpdateOrder - Update an existing order
 */
export const useUpdateOrder = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, input }: { id: string, input: UpdateOrderInput }) => api.updateOrder(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.orderKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: api.orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.orderKeys.stats() });
      if ((options as any).onSuccess) (options as any).onSuccess(data);
    },
  });
};
