/** Inventory Hooks - Using CrudServiceFactory + custom hooks */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/products';
import type { ProductFilters, ProductsResponse } from '../types';

export const inventoryKeys = api.inventoryKeys;

export const useList = (filters: ProductFilters = {} as any) => {
  return useQuery<ProductsResponse>({
    queryKey: api.inventoryKeys.list(filters),
    queryFn: () => api.getProducts(filters),
  });
};

export const useById = (id: string, enabledOrOptions?: boolean | { enabled?: boolean }) => {
  const enabled = typeof enabledOrOptions === 'boolean' ? enabledOrOptions : enabledOrOptions?.enabled ?? true;
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
    mutationFn: (input: any) => api.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.inventoryKeys.all });
    },
  });
};

export const useUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => api.updateProduct(input),
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
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: api.inventoryKeys.all });
      const previousData = queryClient.getQueriesData<ProductsResponse>({ queryKey: api.inventoryKeys.all });
      queryClient.setQueriesData<ProductsResponse>({ queryKey: api.inventoryKeys.all }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((product) => String(product.id) !== String(id)),
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
