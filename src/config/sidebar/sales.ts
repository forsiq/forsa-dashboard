/**
 * Sales topbar module — orders and customers.
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.orders_section',
    items: [
      { path: '/orders', label: 'sidebar.all_orders', icon: 'ShoppingCart' },
      { path: '/orders?status=pending', label: 'sidebar.pending_orders', icon: 'Clock' },
    ],
  },
  {
    title: 'sidebar.customers_section',
    items: [{ path: '/customers', label: 'customer.title', icon: 'Users' }],
  },
];
