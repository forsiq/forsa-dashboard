/**
 * Inventory GraphQL React Query Hooks
 * Uses 'inventory' service
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import * as api from './api';
import type {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  ProductsResponse,
  InventoryStats,
} from '../types';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get paginated list of products
 */
export function useGetProducts(filters: ProductFilters = {}): UseQueryResult<ProductsResponse> {
  return useQuery({
    queryKey: api.inventoryGraphQLKeys.list(filters),
    queryFn: () => api.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a single product by ID
 */
export function useGetProduct(id: string, enabled = true): UseQueryResult<Product> {
  return useQuery({
    queryKey: api.inventoryGraphQLKeys.detail(id),
    queryFn: () => api.getProduct(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get inventory statistics
 */
export function useGetInventoryStats(): UseQueryResult<InventoryStats> {
  return useQuery({
    queryKey: api.inventoryGraphQLKeys.stats(),
    queryFn: () => api.getInventoryStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new product
 */
export function useCreateProduct(options?: {
  onSuccess?: (data: Product) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => api.createProduct(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.inventoryGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.inventoryGraphQLKeys.stats() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Update an existing product
 */
export function useUpdateProduct(options?: {
  onSuccess?: (data: Product) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProductInput) => api.updateProduct(input.id, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: api.inventoryGraphQLKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: api.inventoryGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.inventoryGraphQLKeys.stats() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Delete a product
 */
export function useDeleteProduct(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.inventoryGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.inventoryGraphQLKeys.stats() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}

// ============================================================================
// Export all hooks
// ============================================================================

export const inventoryGraphQLHooks = {
  // Queries
  useGetProducts,
  useGetProduct,
  useGetInventoryStats,
  // Mutations
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
};
