/** Categories Hooks - Using CrudServiceFactory + custom list hook */
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { useMutationContext } from '@core/hooks/useMutationContext';
import { createCrudService } from '@core/services';
import * as api from '../api/categories';
import { useMemo } from 'react';
import type { Category, CreateCategoryInput, UpdateCategoryInput, CategoryFilters, CategoriesResponse, SuggestCategoryInput, ReviewSuggestionInput } from '../types';
import { analyzeCategoryHealth } from '../lib/categoryHealth';
import { resolveCategoryErrorMessage } from '../lib';

const EMPTY_CATEGORIES: Category[] = [];

const categoryService = createCrudService<Category, CreateCategoryInput, UpdateCategoryInput, CategoryFilters>({
  name: 'categories',
  endpoint: '/categories',
});

export const categoryKeys = api.categoryKeys;

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
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => api.createCategory(input),
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.all });
      toast.success(t('toast.category.created'));
      if (options?.onSuccess) options.onSuccess(data, variables, context);
    },
    onError: (error: unknown) => {
      const detail = resolveCategoryErrorMessage(error, t) || getErrorDetail(error);
      toast.error(t('toast.category.create_failed', { detail }), 6000);
    },
  });
};

export const useUpdate = (options?: any) => {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();
  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => api.updateCategory(input),
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.detail(String(data.id)) });
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.all });
      toast.success(t('toast.category.updated'));
      if (options?.onSuccess) options.onSuccess(data, variables, context);
    },
    onError: (error: unknown) => {
      const detail = resolveCategoryErrorMessage(error, t) || getErrorDetail(error);
      toast.error(t('toast.category.update_failed', { detail }), 6000);
    },
  });
};

export const useReorderCategories = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const { queryClient, toast, t } = useMutationContext();
  return useMutation({
    mutationFn: (ids: string[]) => api.reorderCategories(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.all });
      toast.success(t('toast.category.order_saved'));
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error?.message || t('toast.category.order_save_failed'), 6000);
      options?.onError?.(error);
    },
  });
};

export const useDelete = (options?: any) => {
  const { queryClient, toast, t } = useMutationContext();
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
    onError: (_err: unknown, _id: any, context: any) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]: [any, any]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (!options?.onError) {
        toast.error(t('toast.category.delete_failed'), 6000);
      }
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.all });
      toast.success(t('toast.category.deleted'));
      if (options?.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

export const useGetCategories = useList;
export const useGetCategory = useById;
export const useGetCategoryStats = useStats;
export const useCreateCategoryMutation = useCreate;
export const useUpdateCategoryMutation = useUpdate;
export const useDeleteCategoryMutation = useDelete;

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

export function useSuggestCategory(options?: any) {
  const { queryClient, toast, t, getErrorDetail } = useMutationContext();
  return useMutation({
    mutationFn: (input: SuggestCategoryInput) => api.suggestCategory(input),
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.suggestions() });
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.mySuggestions() });
      toast.success(t('toast.category.suggestion_submitted'));
      if (options?.onSuccess) options.onSuccess(data, variables, context);
    },
    onError: (error: unknown) => {
      const detail = resolveCategoryErrorMessage(error, t) || getErrorDetail(error);
      toast.error(t('toast.category.suggestion_failed', { detail }), 6000);
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
  const { queryClient } = useMutationContext();
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

/** Flat list + derived health report for admin cleanup UI. */
export function useCategoryHealthReport(language = 'en') {
  const query = useGetCategories({ limit: 500 } as CategoryFilters);
  const categories = query.data?.categories ?? EMPTY_CATEGORIES;
  const report = useMemo(
    () => analyzeCategoryHealth(categories, language),
    [categories, language],
  );
  return { ...query, report, categories };
}
