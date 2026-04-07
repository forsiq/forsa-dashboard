/**
 * Categories GraphQL React Query Hooks
 * Uses 'product' service for category operations
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';
import { useToast } from '@core/contexts/ToastContext';
import * as api from './api';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryFilters,
  CategoriesResponse,
  CategoryStats,
} from '../types';

// ============================================================================
// Query Hooks
// ============================================================================

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
 * Get paginated list of categories
 */
export function useGetCategories(filters: CategoryFilters = {}): UseQueryResult<CategoriesResponse> {
  const query = useQuery({
    queryKey: api.categoryGraphQLKeys.list(filters),
    queryFn: () => api.getCategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useErrorHandler(query.error, 'Failed to load categories');

  return query;
}

/**
 * Get a single category by ID
 */
export function useGetCategory(id: string, enabled = true): UseQueryResult<Category> {
  const query = useQuery({
    queryKey: api.categoryGraphQLKeys.detail(id),
    queryFn: () => api.getCategory(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  useErrorHandler(query.error, 'Failed to load category');

  return query;
}

/**
 * Get category statistics
 */
export function useGetCategoryStats(): UseQueryResult<CategoryStats> {
  const query = useQuery({
    queryKey: api.categoryGraphQLKeys.stats(),
    queryFn: () => api.getCategoryStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useErrorHandler(query.error, 'Failed to load category stats');

  return query;
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new category
 */
export function useCreateCategory(options?: {
  onSuccess?: (data: Category) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => api.createCategory(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.stats() });
      toast.success('Category created successfully');
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create category: ${error.message}`, 8000);
      options?.onError?.(error);
    },
  });
}

/**
 * Update an existing category
 */
export function useUpdateCategory(options?: {
  onSuccess?: (data: Category) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => api.updateCategory(input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.stats() });
      toast.success('Category updated successfully');
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update category: ${error.message}`, 8000);
      options?.onError?.(error);
    },
  });
}

/**
 * Delete a category
 */
export function useDeleteCategory(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.stats() });
      toast.success('Category deleted successfully');
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete category: ${error.message}`, 8000);
      options?.onError?.(error);
    },
  });
}

/**
 * Update category status
 */
export function useUpdateCategoryStatus() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Category['status'] }) =>
      api.updateCategoryStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.stats() });
      toast.success('Category status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update category status: ${error.message}`, 8000);
    },
  });
}

// ============================================================================
// Export all hooks
// ============================================================================

export const categoryGraphQLHooks = {
  // Queries
  useGetCategories,
  useGetCategory,
  useGetCategoryStats,
  // Mutations
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUpdateCategoryStatus,
};
