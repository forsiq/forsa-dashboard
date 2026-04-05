/**
 * Item GraphQL React Query Hooks
 * Uses 'product' service
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import type { Item, ItemFilters } from '../types';

/**
 * useGetItems - Fetch list of items (products) with filters
 */
export const useGetItems = (filters?: ItemFilters) => {
  return useQuery({
    queryKey: api.itemGraphQLKeys.list(filters || {}),
    queryFn: () => api.getItems(filters),
    staleTime: 60000,
  });
};

/**
 * useGetItem - Fetch single item by ID
 */
export const useGetItem = (id: string) => {
  return useQuery({
    queryKey: api.itemGraphQLKeys.detail(id),
    queryFn: () => api.getItem(id),
    enabled: !!id,
  });
};

/**
 * useCreateItemMutation - Mutation for creating a new item
 */
export const useCreateItemMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newItem: any) => api.createProduct(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.itemGraphQLKeys.lists() });
      if ((options as any).onSuccess) (options as any).onSuccess();
    },
  });
};

/**
 * useUpdateItemMutation - Mutation for updating an item
 */
export const useUpdateItemMutation = (id: string, options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: any) => api.updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.itemGraphQLKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: api.itemGraphQLKeys.lists() });
      if ((options as any).onSuccess) (options as any).onSuccess();
    },
  });
};

/**
 * useDeleteItemMutation - Mutation for deleting an item
 */
export const useDeleteItemMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.itemGraphQLKeys.lists() });
      if ((options as any).onSuccess) (options as any).onSuccess();
    },
  });
};
