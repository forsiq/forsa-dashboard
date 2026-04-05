/**
 * Group Buying GraphQL API Functions
 */

import { gqlQuery, gqlMutation } from '@core/services/GraphQLClient';
import * as Queries from './queries';
import type {
  GroupBuying,
  GroupBuyingCreateInput,
  GroupBuyingUpdateInput,
  GroupBuyingFilters,
  GroupBuyingsResponse,
  GroupBuyingStats,
  GroupBuyingParticipant,
} from '../types';

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get paginated list of group buying campaigns
 */
export async function getGroupBuyings(filters: GroupBuyingFilters = {}): Promise<GroupBuyingsResponse> {
  const variables = Queries.buildGroupBuyingVariables(filters);

  const data = await gqlQuery<{
    groupBuyings: GroupBuying[];
    groupBuyingCount: number;
  }>(Queries.GET_GROUP_BUYINGS_QUERY, variables, 'auction');

  return {
    groupBuyings: data.groupBuyings || [],
    total: data.groupBuyingCount || 0,
    page: filters.page || 1,
    limit: filters.limit || 50,
    totalPages: Math.ceil((data.groupBuyingCount || 0) / (filters.limit || 50)),
  };
}

/**
 * Get a single group buying campaign by ID
 */
export async function getGroupBuying(id: string): Promise<GroupBuying> {
  const data = await gqlQuery<{ groupBuying: GroupBuying }>(
    Queries.GET_GROUP_BUYING_QUERY,
    { id },
    'auction'
  );
  return data.groupBuying;
}

/**
 * Get group buying statistics
 */
export async function getGroupBuyingStats(): Promise<GroupBuyingStats> {
  const data = await gqlQuery<{ groupBuyingStats: GroupBuyingStats }>(
    Queries.GET_GROUP_BUYING_STATS_QUERY,
    {},
    'auction'
  );
  return data.groupBuyingStats;
}

/**
 * Get participants for a group buying campaign
 */
export async function getGroupBuyingParticipants(
  id: string,
  page = 1,
  limit = 20
): Promise<{ participants: GroupBuyingParticipant[]; total: number }> {
  const data = await gqlQuery<{
    groupBuyingParticipants: GroupBuyingParticipant[];
    participantCount: number;
  }>(
    Queries.GET_GROUP_BUYING_PARTICIPANTS_QUERY,
    { id, limit, offset: (page - 1) * limit },
    'auction'
  );
  return {
    participants: data.groupBuyingParticipants || [],
    total: data.participantCount || 0,
  };
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Create a new group buying campaign
 */
export async function createGroupBuying(input: GroupBuyingCreateInput): Promise<GroupBuying> {
  const data = await gqlMutation<{ createGroupBuying: GroupBuying }>(
    Queries.CREATE_GROUP_BUYING_MUTATION,
    { input },
    'auction'
  );
  return data.createGroupBuying;
}

/**
 * Update an existing group buying campaign
 */
export async function updateGroupBuying(input: GroupBuyingUpdateInput): Promise<GroupBuying> {
  const { id, ...data } = input;
  const result = await gqlMutation<{ updateGroupBuying: GroupBuying }>(
    Queries.UPDATE_GROUP_BUYING_MUTATION,
    { id, input: data },
    'auction'
  );
  return result.updateGroupBuying;
}

/**
 * Delete a group buying campaign
 */
export async function deleteGroupBuying(id: string): Promise<{ success: boolean; message: string }> {
  const data = await gqlMutation<{ deleteGroupBuying: { success: boolean; message: string } }>(
    Queries.DELETE_GROUP_BUYING_MUTATION,
    { id },
    'auction'
  );
  return data.deleteGroupBuying;
}

/**
 * Update group buying campaign status
 */
export async function updateGroupBuyingStatus(
  id: string,
  status: GroupBuying['status']
): Promise<GroupBuying> {
  const data = await gqlMutation<{ updateGroupBuyingStatus: GroupBuying }>(
    Queries.UPDATE_GROUP_BUYING_STATUS_MUTATION,
    { id, status },
    'auction'
  );
  return data.updateGroupBuyingStatus;
}

/**
 * Join a group buying campaign
 */
export async function joinGroupBuying(groupBuyingId: string, quantity: number): Promise<GroupBuyingParticipant> {
  const data = await gqlMutation<{ joinGroupBuying: GroupBuyingParticipant }>(
    Queries.JOIN_GROUP_BUYING_MUTATION,
    { groupBuyingId, quantity },
    'auction'
  );
  return data.joinGroupBuying;
}

// ============================================================================
// Query Keys for React Query Cache
// ============================================================================

export const groupBuyingKeys = {
  all: ['groupBuyings'] as const,
  lists: () => [...groupBuyingKeys.all, 'list'] as const,
  list: (filters: GroupBuyingFilters) => [...groupBuyingKeys.lists(), filters] as const,
  details: () => [...groupBuyingKeys.all, 'detail'] as const,
  detail: (id: string) => [...groupBuyingKeys.details(), id] as const,
  stats: () => [...groupBuyingKeys.all, 'stats'] as const,
  participants: (id: string) => [...groupBuyingKeys.all, 'participants', id] as const,
} as const;
