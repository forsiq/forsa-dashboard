/** Categories Hooks - Using REST */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/categories';
import type { Category, CreateCategoryInput, UpdateCategoryInput, CategoryFilters } from '../types';

export const useList = (filters: CategoryFilters = {} as any) => {
  return useQuery({
    queryKey: api.categoryKeys.list(filters),
    queryFn: () => api.getCategories(filters),
  });
};

export const useById = (id: string, enabled = true) => {
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

export const useCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => api.createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.all });
    },
  });
};

export const useUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCategoryInput) => api.updateCategory(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.detail(String(data.id)) });
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.all });
    },
  });
};

export const useDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.categoryKeys.all });
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

