/**
 * Inventory GraphQL React Query Hooks
 * Uses 'inventory' service
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { useToast } from '@core/contexts/ToastContext';
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
 * Hook to show error toast only once per unique error
 */
function useErrorHandler(error: Error | null, messagePrefix: string) {
  const toast = useToast();
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    if (error) {
      const errorKey = `${messagePrefix}:${error.message}`;
      // Only show toast if this is a new error
      if (lastErrorRef.current !== errorKey) {
        lastErrorRef.current = errorKey;
        toast.error(`${messagePrefix}: ${error.message}`, 8000);
      }
    } else {
      // Reset when no error
      lastErrorRef.current = null;
    }
  }, [error, messagePrefix, toast]);
}

/**
 * Get paginated list of products
 */
export function useGetProducts(filters: ProductFilters = {}): UseQueryResult<ProductsResponse> {
  const query = useQuery({
    queryKey: api.inventoryGraphQLKeys.list(filters),
    queryFn: () => api.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useErrorHandler(query.error, 'Failed to load products');

  return query;
}

/**
 * Get a single product by ID
 */
export function useGetProduct(id: string, enabled = true): UseQueryResult<Product> {
  const query = useQuery({
    queryKey: api.inventoryGraphQLKeys.detail(id),
    queryFn: () => api.getProduct(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useErrorHandler(query.error, 'Failed to load product');

  return query;
}

/**
 * Get inventory statistics
 */
export function useGetInventoryStats(): UseQueryResult<InventoryStats> {
  const query = useQuery({
    queryKey: api.inventoryGraphQLKeys.stats(),
    queryFn: () => api.getInventoryStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useErrorHandler(query.error, 'Failed to load inventory stats');

  return query;
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
  const toast = useToast();

  return useMutation({
    mutationFn: (input: CreateProductInput) => api.createProduct(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.inventoryGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.inventoryGraphQLKeys.stats() });
      toast.success('Product created successfully');
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create product: ${error.message}`, 8000);
      options?.onError?.(error);
    },
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
  const toast = useToast();

  return useMutation({
    mutationFn: (input: UpdateProductInput) => api.updateProduct(input.id, input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: api.inventoryGraphQLKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: api.inventoryGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.inventoryGraphQLKeys.stats() });
      toast.success('Product updated successfully');
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update product: ${error.message}`, 8000);
      options?.onError?.(error);
    },
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
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.inventoryGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.inventoryGraphQLKeys.stats() });
      toast.success('Product deleted successfully');
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete product: ${error.message}`, 8000);
      options?.onError?.(error);
    },
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
