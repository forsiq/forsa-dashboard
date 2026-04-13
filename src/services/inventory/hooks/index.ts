/** Inventory Hooks - Using REST */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/products';
import type { CreateProductInput, UpdateProductInput, ProductFilters } from '../types';

export const useList = (filters: ProductFilters = {} as any) => {
  return useQuery({
    queryKey: api.inventoryKeys.list(filters),
    queryFn: () => api.getProducts(filters),
  });
};

export const useById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: api.inventoryKeys.detail(id),
    queryFn: () => api.getProduct(id),
    enabled: enabled && !!id,
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: api.inventoryKeys.stats(),
    queryFn: api.getInventoryStats,
  });
};

export const useCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => api.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.inventoryKeys.all });
    },
  });
};

export const useUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProductInput) => api.updateProduct(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.inventoryKeys.detail(String(data.id)) });
      queryClient.invalidateQueries({ queryKey: api.inventoryKeys.all });
    },
  });
};

export const useDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.inventoryKeys.all });
    },
  });
};

// Aliases for existing code
export const useGetProducts = useList;
export const useGetProduct = useById;
export const useGetInventoryStats = useStats;
export const useCreateProduct = useCreate;
export const useUpdateProduct = useUpdate;
export const useDeleteProduct = useDelete;