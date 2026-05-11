/** Categories Hooks - Using CrudServiceFactory + custom list hook */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCrudService } from '@core/services';
import * as api from '../api/categories';
import type { Category, CreateCategoryInput, UpdateCategoryInput, CategoryFilters, CategoriesResponse } from '../types';

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
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => api.createCategory(input),
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.all });
      if (options?.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

export const useUpdate = (options?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => api.updateCategory(input),
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.detail(String(data.id)) });
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.all });
      if (options?.onSuccess) options.onSuccess(data, variables, context);
    },
  });
};

export const useDelete = (options?: any) => {
  const queryClient = useQueryClient();
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
    },
    ...options,
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.all });
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
