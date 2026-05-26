/** Categories Hooks - Using CrudServiceFactory + custom list hook */
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useToast } from '@core/contexts/ToastContext';
import { createCrudService } from '@core/services';
import * as api from '../api/categories';
import type { Category, CreateCategoryInput, UpdateCategoryInput, CategoryFilters, CategoriesResponse, SuggestCategoryInput, ReviewSuggestionInput } from '../types';

const categoryService = createCrudService<Category, CreateCategoryInput, UpdateCategoryInput, CategoryFilters>({
  name: 'categories',
  endpoint: '/categories',
});

export const categoryKeys = api.categoryKeys;

// Use custom list hook to preserve CategoriesResponse shape
export const useList = (filters: CategoryFilters = {} as any) => {
  return useQuery<CategoriesResponse>({
    queryKey: api.categoryKeys.list(filters),
    queryFn: () => api.getCategories(filters),
    placeholderData: keepPreviousData,
  });
};

export const useById = (id: string, enabledOrOptions?: boolean | { enabled?: boolean }) => {
  const enabled = typeof enabledOrOptions === 'boolean' ? enabledOrOptions : enabledOrOptions?.enabled ?? true;
  return useQuery({
    queryKey: api.categoryKeys.detail(id),
    queryFn: () => api.getCategory(id),
    enabled: enabled && !!id,
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: api.categoryKeys.stats(),
    queryFn: api.getCategoryStats,
  });
};

export const useCreate = (options?: any) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => api.createCategory(input),
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.all });
      toast.success('Category created successfully');
      if (options?.onSuccess) options.onSuccess(data, variables, context);
    },
    onError: (error: any) => {
      toast.error(`Failed to create category: ${error?.message || 'Unknown error'}`, 6000);
    },
  });
};

export const useUpdate = (options?: any) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => api.updateCategory(input),
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.detail(String(data.id)) });
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.all });
      toast.success('Category updated successfully');
      if (options?.onSuccess) options.onSuccess(data, variables, context);
    },
    onError: (error: any) => {
      toast.error(`Failed to update category: ${error?.message || 'Unknown error'}`, 6000);
    },
  });
};

export const useReorderCategories = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (ids: string[]) => api.reorderCategories(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.all });
      toast.success('Category order saved');
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Failed to save category order', 6000);
      options?.onError?.(error);
    },
  });
};

export const useDelete = (options?: any) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: api.categoryKeys.all });
      const previousData = queryClient.getQueriesData<CategoriesResponse>({ queryKey: api.categoryKeys.all });
      queryClient.setQueriesData<CategoriesResponse>({ queryKey: api.categoryKeys.all }, (old) => {
        if (!old) return old;
        return {
          ...old,
          categories: old.categories.filter((cat) => String(cat.id) !== String(id)),
          total: Math.max(0, old.total - 1),
        };
      });
      return { previousData };
    },
    onError: (_err: any, _id: any, context: any) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]: [any, any]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (!options?.onError) {
        toast.error(`Failed to delete category`, 6000);
      }
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.all });
      toast.success('Category deleted successfully');
      if (options?.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

// Aliases for existing code
export const useGetCategories = useList;
export const useGetCategory = useById;
export const useGetCategoryStats = useStats;
export const useCreateCategoryMutation = useCreate;
export const useUpdateCategoryMutation = useUpdate;
export const useDeleteCategoryMutation = useDelete;

// Tree & Hierarchy hooks
export function useCategoryTree() {
  return useQuery({
    queryKey: api.categoryKeys.tree(),
    queryFn: ({ signal }) => api.getCategoryTree(signal),
  });
}

export function useMainCategories() {
  return useQuery({
    queryKey: api.categoryKeys.mainCategories(),
    queryFn: ({ signal }) => api.getMainCategories(signal),
  });
}

export function useCategoryChildren(parentId: string | number | null, enabled = true) {
  return useQuery({
    queryKey: api.categoryKeys.children(parentId!),
    queryFn: ({ signal }) => api.getCategoryChildren(parentId!, signal),
    enabled: !!parentId && enabled,
  });
}

// Suggestion hooks
export function useSuggestCategory(options?: any) {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (input: SuggestCategoryInput) => api.suggestCategory(input),
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.suggestions() });
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.mySuggestions() });
      toast.success('Category suggestion submitted for review');
      if (options?.onSuccess) options.onSuccess(data, variables, context);
    },
    onError: (error: any) => {
      toast.error(`Failed to submit suggestion: ${error?.message || 'Unknown error'}`, 6000);
    },
  });
}

export function useCategorySuggestions(status?: string) {
  return useQuery({
    queryKey: [...api.categoryKeys.suggestions(), status],
    queryFn: ({ signal }) => api.getCategorySuggestions(status, signal),
  });
}

export function useReviewSuggestion(options?: any) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ReviewSuggestionInput }) =>
      api.reviewSuggestion(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.suggestions() });
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.tree() });
    },
    ...options,
  });
}

export function useMySuggestions() {
  return useQuery({
    queryKey: api.categoryKeys.mySuggestions(),
    queryFn: ({ signal }) => api.getMySuggestions(signal),
  });
}
