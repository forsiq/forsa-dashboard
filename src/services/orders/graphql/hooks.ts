/**
 * Order GraphQL React Query Hooks
 * Uses 'order' service
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { useToast } from '@core/contexts/ToastContext';
import * as api from './api';
import type { OrderFilters, CreateOrderInput, UpdateOrderInput } from '../types';

/**
 * Hook to show error toast only once per unique error
 */
function useErrorHandler(error: Error | null, messagePrefix: string) {
  const { error: toastError } = useToast();
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (error) {
      const errorKey = `${messagePrefix}:${error.message}`;
      // Only show toast if this is a new error
      if (lastErrorRef.current !== errorKey) {
        lastErrorRef.current = errorKey;
        toastError(`${messagePrefix}: ${error.message}`, 8000);
      }
    } else {
      // Reset when no error
      lastErrorRef.current = null;
    }
  }, [error, messagePrefix, toastError]);
}

/**
 * useGetOrders - Fetch list of orders with filters
 */
export const useGetOrders = (filters?: OrderFilters) => {
  const query = useQuery({
    queryKey: api.orderKeys.list(filters || {}),
    queryFn: () => api.getOrders(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  useErrorHandler(query.error, 'Failed to load orders');

  return query;
};

/**
 * useGetOrder - Fetch single order by ID
 */
export const useGetOrder = (id: string) => {
  const query = useQuery({
    queryKey: api.orderKeys.detail(id),
    queryFn: () => api.getOrder(id),
    enabled: !!id,
  });

  useErrorHandler(query.error, 'Failed to load order');

  return query;
};

/**
 * useGetOrderStats - Fetch order statistics
 */
export const useGetOrderStats = () => {
  const query = useQuery({
    queryKey: api.orderKeys.stats(),
    queryFn: () => api.getOrderStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useErrorHandler(query.error, 'Failed to load order stats');

  return query;
};

/**
 * useCreateOrder - Create a new order
 */
export const useCreateOrder = (options = {}) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => api.createOrder(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.orderKeys.stats() });
      toast.success('Order created successfully');
      if ((options as any).onSuccess) (options as any).onSuccess(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create order: ${error.message}`, 8000);
    }
  });
};

/**
 * useUpdateOrder - Update an existing order
 */
export const useUpdateOrder = (options = {}) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string, input: UpdateOrderInput }) => api.updateOrder(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.orderKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: api.orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.orderKeys.stats() });
      toast.success('Order updated successfully');
      if ((options as any).onSuccess) (options as any).onSuccess(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update order: ${error.message}`, 8000);
    }
  });
};
