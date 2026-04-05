/** Categories Hooks Compatibility */
import { categoryService } from '../config';

// REST API Hooks (fallback)
export function useList(filters = {}, options = {}) {
  return categoryService.usePaginatedList(filters, options);
}

export function useById(id: string, options = {}) {
  return categoryService.useById(id, options);
}

export function useStats(options = {}) {
  return categoryService.useStats(options);
}

export function useCreate(options = {}) {
  return categoryService.useCreate(options);
}

export function useUpdate(options = {}) {
  return categoryService.useUpdate(options);
}

export function useDelete(options = {}) {
  return categoryService.useDelete(options);
}

// Aliases for existing code
export const useGetCategories = useList;
export const useGetCategory = useById;
export const useGetCategoryStats = useStats;
export const useCreateCategoryMutation = useCreate;
export const useUpdateCategoryMutation = useUpdate;
export const useDeleteCategoryMutation = useDelete;

// GraphQL Hooks (recommended for new code)
// Export from ../graphql/hooks
export * from '../graphql/hooks';
