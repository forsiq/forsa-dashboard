/** Categories Hooks - Using GraphQL */
import * as graphqlHooks from '../graphql/hooks';

// Re-export all GraphQL hooks as default
export const useList = graphqlHooks.useGetCategories;
export const useById = (id: string, enabled = true) => graphqlHooks.useGetCategory(id, enabled);
export const useStats = graphqlHooks.useGetCategoryStats;
export const useCreate = graphqlHooks.useCreateCategory;
export const useUpdate = graphqlHooks.useUpdateCategory;
export const useDelete = graphqlHooks.useDeleteCategory;

// Aliases for existing code
export const useGetCategories = useList;
export const useGetCategory = useById;
export const useGetCategoryStats = useStats;
export const useCreateCategoryMutation = useCreate;
export const useUpdateCategoryMutation = useUpdate;
export const useDeleteCategoryMutation = useDelete;

// Also export all GraphQL hooks directly for access to categoryGraphQLHooks
export * from '../graphql/hooks';
