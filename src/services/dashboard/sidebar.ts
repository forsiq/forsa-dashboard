/**
 * Dashboard Module Sidebar Configuration
 * Dashboard, Live Monitor, Settlements, Moderation, Users, Settings
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.dashboard',
    items: [
      { path: '/dashboard', label: 'sidebar.dashboard', icon: 'Activity' },
      { path: '/live-monitor', label: 'sidebar.live_monitor', icon: 'Radio' },
      { path: '/settlements', label: 'sidebar.settlements', icon: 'Landmark' },
      { path: '/moderation', label: 'sidebar.moderation', icon: 'Shield' },
      { path: '/users', label: 'sidebar.users', icon: 'UserCog' },
      { path: '/settings', label: 'sidebar.settings', icon: 'Settings' },
    ],
  },
];
