/** 
 * Orders Hooks - Migrated to GraphQL (order service)
 */
export {
  useGetOrders,
  useGetOrder,
  useGetOrderStats,
  useCreateOrder as useCreate,
  useUpdateOrder as useUpdate,
} from '../graphql';

// Compatibility aliases
export { useGetOrders as useList } from '../graphql';
export { useGetOrder as useById } from '../graphql';
export { useGetOrderStats as useStats } from '../graphql';

import { useUpdateOrder } from '../graphql';
export function useDelete() {
  return { mutate: () => { console.warn('Delete not implemented in GraphQL for orders'); } };
}

export async function updateOrderStatus(id: string, status: any) {
  // This would normally be a direct API call or a mutation
  console.warn('updateOrderStatus called - should use useUpdateOrder mutation');
}