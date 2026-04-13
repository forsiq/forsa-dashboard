/** Items Hooks - Using REST */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/items';
import type { ItemFilters } from '../types';

export const useGetItems = (filters: ItemFilters = {} as any) => {
  return useQuery({
    queryKey: api.itemKeys.list(filters),
    queryFn: () => api.getItems(filters),
  });
};

export const useGetItem = (id: string, enabled = true) => {
  return useQuery({
    queryKey: api.itemKeys.detail(id),
    queryFn: () => api.getItem(id),
    enabled: enabled && !!id,
  });
};

export const useCreateItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => api.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.itemKeys.all });
    },
  });
};

export const useDeleteItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.itemKeys.all });
    },
  });
};

