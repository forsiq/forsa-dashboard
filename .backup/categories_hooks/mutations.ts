import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  categoryKeys,
} from '../api/categories';
import type { CreateCategoryInput, UpdateCategoryInput } from '../types';

// --- Mutation Hooks ---

/**
 * Create category mutation
 *
 * @example
 * const createMutation = useCreateCategoryMutation({
 *   onSuccess: (data) => {
 *     toast.success('Category created');
 *     router.push(`/categories/${data.id}`);
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 */
export function useCreateCategoryMutation(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: (data) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      // Add the new category to the cache
      queryClient.setQueryData(categoryKeys.detail(data.id), data);
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Update category mutation
 *
 * @example
 * const updateMutation = useUpdateCategoryMutation({
 *   onSuccess: (data) => {
 *     toast.success('Category updated');
 *     router.push(`/categories/${data.id}`);
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * // Usage
 * updateMutation.mutate({ id: '123', name: 'New Name' });
 */
export function useUpdateCategoryMutation(options?: {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => updateCategory(input),
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: categoryKeys.detail(variables.id!) });

      // Snapshot previous value
      const previousCategory = queryClient.getQueryData(categoryKeys.detail(variables.id!));

      // Optimistically update to the new value
      queryClient.setQueryData(categoryKeys.detail(variables.id!), (old: any) => ({
        ...old,
        ...variables,
      }));

      // Return context with previous value
      return { previousCategory };
    },
    onError: (error, variables, context) => {
      // Rollback to previous value on error
      if (context?.previousCategory) {
        queryClient.setQueryData(
          categoryKeys.detail(variables.id!),
          context.previousCategory
        );
      }
      options?.onError?.(error);
    },
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.stats() });
      queryClient.setQueryData(categoryKeys.detail(data.id), data);
      options?.onSuccess?.(data);
    },
  });
}

/**
 * Delete category mutation
 *
 * @example
 * const deleteMutation = useDeleteCategoryMutation({
 *   onSuccess: () => {
 *     toast.success('Category deleted');
 *     router.push('/categories');
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * // Usage
 * deleteMutation.mutate('category-id');
 */
export function useDeleteCategoryMutation(options?: {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: categoryKeys.lists() });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData(categoryKeys.lists());

      // Optimistically remove from cache
      queryClient.setQueryData(categoryKeys.lists(), (old: any) => ({
        ...old,
        categories: old.categories.filter((c: any) => c.id !== id),
        total: old.total - 1,
      }));

      // Return context
      return { previousCategories };
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousCategories) {
        queryClient.setQueryData(categoryKeys.lists(), context.previousCategories);
      }
      options?.onError?.(error);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.stats() });
      options?.onSuccess?.();
    },
  });
}

/**
 * Upload category image mutation
 *
 * @example
 * const uploadMutation = useUploadCategoryImageMutation({
 *   onSuccess: (data) => {
 *     toast.success('Image uploaded');
 *     setImageUrl(data.url);
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * // Usage
 * uploadMutation.mutate(file);
 */
export function useUploadCategoryImageMutation(options?: {
  onSuccess?: (data: { url: string }) => void;
  onError?: (error: any) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadCategoryImage(file),
    onSuccess: (data) => {
      // Invalidate category queries that might contain this image
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}
