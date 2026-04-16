/**
 * Categories Service Sidebar Configuration
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.catalog',
    items: [
      { path: '/categories', label: 'category.all', icon: 'FolderTree' },
      { path: '/categories/new', label: 'category.add', icon: 'Plus' },
    ],
  },
];
