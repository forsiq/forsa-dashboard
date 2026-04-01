/**
 * Customer GraphQL React Query Hooks
 * Exports GraphQL-based hooks for customers service
 */

export {
  useGetCustomers,
  useGetCustomer,
  useGetCustomerStats,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useUpdateCustomerStatus,
  prefetchCustomer,
} from '../graphql/hooks';

// Compatibility aliases
export {
  useCreateCustomer as useCreateCustomerMutation,
  useUpdateCustomer as useUpdateCustomerMutation,
  useDeleteCustomer as useDeleteCustomerMutation,
} from '../graphql/hooks';

// Re-export query keys for cache management
export { customerKeys } from '../graphql/api';
