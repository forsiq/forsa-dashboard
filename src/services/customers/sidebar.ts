/**
 * Customers Service Sidebar Configuration
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.customers',
    items: [
      { path: '/customers', label: 'customer.all', icon: 'Users' },
      { path: '/customers/new', label: 'customer.add', icon: 'UserPlus' },
      { path: '/customers/segments', label: 'customer.segments', icon: 'Tags' },
    ],
  },
];
