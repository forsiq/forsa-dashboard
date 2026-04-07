/** Inventory Hooks - Using GraphQL */
import * as graphqlHooks from '../graphql';

// Export GraphQL hooks directly
export const useList = graphqlHooks.useGetProducts;
export const useById = (id: string, enabled = true) => graphqlHooks.useGetProduct(id, enabled);
export const useStats = graphqlHooks.useGetInventoryStats;

// Export mutation hooks
export const useCreate = graphqlHooks.useCreateProduct;
export const useUpdate = graphqlHooks.useUpdateProduct;
export const useDelete = graphqlHooks.useDeleteProduct;

// Aliases for existing code
export const useGetProducts = useList;
export const useGetProduct = useById;
export const useGetInventoryStats = useStats;

// Export GraphQL hooks directly for access to inventoryGraphQLHooks
export * from '../graphql';