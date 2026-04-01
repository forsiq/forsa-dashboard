/**
 * Dashboard Feature Sidebar Configuration
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.dashboards',
    items: [
      { path: '/dashboard', label: 'sidebar.dashboard', icon: 'Activity' },
      { path: '/dashboard/analytics', label: 'sidebar.analytics', icon: 'TrendingUp' },
      { path: '/dashboard/activity', label: 'sidebar.activity', icon: 'Clock' },
    ],
  },
];
