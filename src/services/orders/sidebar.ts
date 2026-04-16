/**
 * Orders Service Sidebar Configuration
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.orders',
    items: [
      { path: '/orders', label: 'orders.all', icon: 'ShoppingCart' },
      { path: '/orders/pending', label: 'orders.pending', icon: 'Clock' },
      { path: '/orders/processing', label: 'orders.processing', icon: 'Loader' },
      { path: '/orders/delivered', label: 'orders.delivered', icon: 'CheckCircle' },
      { path: '/orders/new', label: 'orders.create', icon: 'Plus' },
    ],
  },
];
