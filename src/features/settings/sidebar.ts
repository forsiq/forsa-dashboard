/**
 * Settings Feature Sidebar Configuration
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.settings',
    items: [
      { path: '/settings', label: 'settings.general', icon: 'Settings' },
      { path: '/settings/profile', label: 'settings.profile', icon: 'User' },
      { path: '/settings/security', label: 'settings.security', icon: 'Shield' },
      { path: '/settings/notifications', label: 'settings.notifications', icon: 'Bell' },
    ],
  },
];
