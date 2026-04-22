/**
 * Group Buying REST API Service
 */

import { createApiClient } from '@core/services/ApiClientFactory';
import type {
  GroupBuying,
  GroupBuyingCreateInput,
  GroupBuyingUpdateInput,
  GroupBuyingFilters,
  GroupBuyingsResponse,
  GroupBuyingStats,
  GroupBuyingParticipant,
} from '../types';

/**
 * Base Group Buying API implementation
 */
export const groupBuyingBaseApi = createApiClient<GroupBuying, GroupBuyingCreateInput, GroupBuyingUpdateInput, GroupBuyingFilters>({
  serviceName: 'group-deals',
  endpoint: '/group-deals',
});

/**
 * Group Buying API - main operations
 */
export const groupBuyingApi = {
  /**
   * Get paginated list of campaigns
   */
  list: async (filters?: GroupBuyingFilters): Promise<GroupBuyingsResponse> => {
    const response = await groupBuyingBaseApi.list(filters) as any;
    const groupBuyings = response.data || [];
    const total = response.total || groupBuyings.length;
    
    return {
      groupBuyings,
      total,
      page: filters?.page || 1,
      limit: filters?.limit || 50,
      totalPages: Math.ceil(total / (filters?.limit || 50)),
    };
  },

  /**
   * Get single campaign by ID
   */
  get: async (id: string): Promise<GroupBuying> => {
    const response = await groupBuyingBaseApi.getById(id);
    return response.data;
  },

  /**
   * Create a new campaign
   */
  create: async (data: GroupBuyingCreateInput): Promise<GroupBuying> => {
    const response = await groupBuyingBaseApi.create(data);
    return response.data;
  },

  /**
   * Update an existing campaign
   */
  update: async (input: GroupBuyingUpdateInput): Promise<GroupBuying> => {
    const response = await groupBuyingBaseApi.update({ ...input, id: input.id! });
    return response.data;
  },

  /**
   * Delete a campaign
   */
  delete: async (id: string): Promise<void> => {
    await groupBuyingBaseApi.delete(id);
  },

  /**
   * Get campaign statistics
   */
  getStats: async (): Promise<GroupBuyingStats> => {
    const response = await groupBuyingBaseApi.getStats();
    const stats = response.data;
    return {
      activeCampaigns: stats.active_campaigns || 0,
      completedCampaigns: stats.completed_campaigns || 0,
      totalParticipants: stats.total_participants || 0,
      totalRevenue: stats.total_revenue || 0,
    };
  },

  /**
   * Join a campaign
   */
  join: async (id: string, quantity: number): Promise<GroupBuyingParticipant> => {
    const response = await groupBuyingBaseApi.getInstance().post(`/group-buying/${id}/join/`, { quantity });
    return response.data.data;
  },

  /**
   * Leave a campaign
   */
  leave: async (id: string): Promise<void> => {
    await groupBuyingBaseApi.getInstance().post(`/group-buying/${id}/leave/`);
  },

  /**
   * Get campaign participants
   */
  getParticipants: async (id: string, page = 1, limit = 20): Promise<{ participants: GroupBuyingParticipant[]; total: number }> => {
    const response = await groupBuyingBaseApi.getInstance().get(`/group-buying/${id}/participants/`, {
      params: { page, limit }
    });
    return {
      participants: response.data.data || [],
      total: response.data.total || 0,
    };
  },

  /**
   * Start deal: draft/scheduled -> active
   */
  start: async (id: string): Promise<GroupBuying> => {
    const client = groupBuyingBaseApi.getInstance();
    const response = await client.post(`/group-deals/${id}/start/`);
    return response.data.data;
  },

  /**
   * Cancel deal: any -> cancelled
   */
  cancel: async (id: string): Promise<GroupBuying> => {
    const client = groupBuyingBaseApi.getInstance();
    const response = await client.post(`/group-deals/${id}/cancel/`);
    return response.data.data;
  },

  /**
   * Complete deal: unlocked/active -> completed
   */
  complete: async (id: string): Promise<GroupBuying> => {
    const client = groupBuyingBaseApi.getInstance();
    const response = await client.post(`/group-deals/${id}/complete/`);
    return response.data.data;
  },
};
