/**
 * Categories GraphQL React Query Hooks
 * Uses 'product' service for category operations
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
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
 * Get paginated list of categories
 */
export function useGetCategories(filters: CategoryFilters = {}): UseQueryResult<CategoriesResponse> {
  return useQuery({
    queryKey: api.categoryGraphQLKeys.list(filters),
    queryFn: () => api.getCategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a single category by ID
 */
export function useGetCategory(id: string, enabled = true): UseQueryResult<Category> {
  return useQuery({
    queryKey: api.categoryGraphQLKeys.detail(id),
    queryFn: () => api.getCategory(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get category statistics
 */
export function useGetCategoryStats(): UseQueryResult<CategoryStats> {
  return useQuery({
    queryKey: api.categoryGraphQLKeys.stats(),
    queryFn: () => api.getCategoryStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
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
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => api.createCategory(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.stats() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
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
  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => api.updateCategory(input),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.stats() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
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
  return useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.stats() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}

/**
 * Update category status
 */
export function useUpdateCategoryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Category['status'] }) =>
      api.updateCategoryStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.categoryGraphQLKeys.stats() });
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
