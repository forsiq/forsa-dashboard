/**
 * Dashboard Feature Types
 * Developer workspace - modify as needed
 */

import type { ApiResponse } from '../common';

/**
 * Dashboard stat card
 */
export interface DashboardStat {
  label: string;
  value: string | number;
  color: string;
  icon: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  period?: string;
}

/**
 * Activity feed item
 */
export interface ActivityItem {
  id: string;
  type: 'order' | 'customer' | 'inventory' | 'system';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
  action?: string;
  actionUrl?: string;
}

/**
 * Quick action item
 */
export interface QuickAction {
  label: string;
  icon: string;
  url: string;
  color?: string;
}

/**
 * Dashboard data
 */
export interface DashboardData {
  stats: DashboardStat[];
  activities: ActivityItem[];
  quickActions: QuickAction[];
}

/**
 * API response types for dashboard
 */
export type DashboardDataResponse = ApiResponse<DashboardData>;
export type ActivityFeedResponse = ApiResponse<{ activities: ActivityItem[] }>;
