/**
 * Sales Module Sidebar Configuration
 * Orders, Customers
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.commerce',
    items: [
      { path: '/orders', label: 'order.title', icon: 'ShoppingCart' },
      { path: '/customers', label: 'customer.title', icon: 'Users' },
    ],
  },
];
