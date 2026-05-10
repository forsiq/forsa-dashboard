/**
 * Dashboard topbar module — sidebar menu sections only (no runtime API here).
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.operations',
    items: [
      { path: '/dashboard', label: 'sidebar.dashboard', icon: 'Activity' },
      { path: '/live-monitor', label: 'sidebar.live_monitor', icon: 'Radio' },
      { path: '/moderation', label: 'sidebar.moderation', icon: 'Shield' },
    ],
  },
  {
    title: 'sidebar.administration',
    items: [
      { path: '/settlements', label: 'sidebar.settlements', icon: 'Landmark' },
      { path: '/users', label: 'sidebar.users', icon: 'UserCog' },
      { path: '/settings', label: 'sidebar.settings', icon: 'Settings' },
    ],
  },
];
