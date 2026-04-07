/**
 * Item GraphQL React Query Hooks
 * Uses 'product' service
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useToast } from '@core/contexts/ToastContext';
import * as api from './api';
import type { Item, ItemFilters } from '../types';

/**
 * useGetItems - Fetch list of items (products) with filters
 */
export const useGetItems = (filters?: ItemFilters) => {
  const toast = useToast();
  const query = useQuery({
    queryKey: api.itemGraphQLKeys.list(filters || {}),
    queryFn: () => api.getItems(filters),
    staleTime: 60000,
  });

  // Show toast on error (React Query v5 pattern)
  useEffect(() => {
    if (query.error) {
      toast.error(`Failed to load items: ${query.error.message}`, 8000);
    }
  }, [query.error, toast]);

  return {
    ...query,
    items: query.data?.items || [],
    totalCount: query.data?.totalCount || 0
  };
};

/**
 * useGetItem - Fetch single item by ID
 */
export const useGetItem = (id: string) => {
  const toast = useToast();
  const query = useQuery({
    queryKey: api.itemGraphQLKeys.detail(id),
    queryFn: () => api.getItem(id),
    enabled: !!id,
  });

  // Show toast on error
  useEffect(() => {
    if (query.error && id) {
      toast.error(`Failed to load item: ${query.error.message}`, 8000);
    }
  }, [query.error, id, toast]);

  return query;
};

/**
 * useCreateItemMutation - Mutation for creating a new item
 */
export const useCreateItemMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (newItem: any) => api.createProduct(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.itemGraphQLKeys.lists() });
      toast.success('Item created successfully');
      if ((options as any).onSuccess) (options as any).onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Failed to create item: ${error.message}`, 8000);
    },
  });
};

/**
 * useUpdateItemMutation - Mutation for updating an item
 */
export const useUpdateItemMutation = (id: string, options = {}) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (input: any) => api.updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.itemGraphQLKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: api.itemGraphQLKeys.lists() });
      toast.success('Item updated successfully');
      if ((options as any).onSuccess) (options as any).onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update item: ${error.message}`, 8000);
    },
  });
};

/**
 * useDeleteItemMutation - Mutation for deleting an item
 */
export const useDeleteItemMutation = (options = {}) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.itemGraphQLKeys.lists() });
      toast.success('Item deleted successfully');
      if ((options as any).onSuccess) (options as any).onSuccess();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete item: ${error.message}`, 8000);
    },
  });
};
