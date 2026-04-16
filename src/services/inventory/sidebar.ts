/**
 * Inventory Service Sidebar Configuration
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.inventory',
    items: [
      { path: '/inventory', label: 'inventory.overview', icon: 'Package' },
      { path: '/inventory/products', label: 'inventory.products', icon: 'Box' },
      { path: '/inventory/warehouses', label: 'inventory.warehouses', icon: 'Warehouse' },
      { path: '/inventory/movements', label: 'inventory.movements', icon: 'ArrowUpDown' },
      { path: '/inventory/add', label: 'inventory.add_item', icon: 'Plus' },
    ],
  },
];
