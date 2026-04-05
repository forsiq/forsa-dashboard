/**
 * Items GraphQL Module - Public API
 * Uses 'product' service
 */

export {
  useGetItems,
  useGetItem,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} from './hooks';

export { itemGraphQLKeys as itemKeys } from './api';
