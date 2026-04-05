/**
 * Group Buying GraphQL Module - Public API
 *
 * Exports all hooks and utilities for group buying management
 */

// Query Hooks
export {
  useGetGroupBuyings,
  useGetGroupBuying,
  useGetGroupBuyingStats,
  useGetGroupBuyingParticipants,
} from './hooks';

// Mutation Hooks
export {
  useCreateGroupBuying,
  useUpdateGroupBuying,
  useDeleteGroupBuying,
  useUpdateGroupBuyingStatus,
  useJoinGroupBuying,
} from './hooks';

// Prefetch Functions
export {
  prefetchGroupBuying,
} from './hooks';

// Query Keys
export { groupBuyingKeys } from './api';

// Helper Functions
export {
  formatCurrency,
  calculateDiscount,
  calculateProgress,
  getStatusVariant,
} from './utils';

export {
  buildGroupBuyingVariables,
} from './queries';

// Types
export type {
  GroupBuying,
  GroupBuyingCreateInput,
  GroupBuyingUpdateInput,
  GroupBuyingFilters,
  GroupBuyingsResponse,
  GroupBuyingStats,
  GroupBuyingParticipant,
  GroupBuyingParticipantsResponse,
} from '../types';
