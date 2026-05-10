/**
 * Marketplace & Inventory Module Sidebar Configuration
 * Auctions, Listings, Amazon Import, Categories, Group Buying, Inventory
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.marketplace',
    items: [
      { path: '/auctions', label: 'sidebar.auctions', icon: 'Gavel' },
      { path: '/listings', label: 'sidebar.listings', icon: 'Package' },
      { path: '/amazon-import', label: 'sidebar.amazon_import', icon: 'ShoppingBag' },
      { path: '/categories', label: 'sidebar.categories', icon: 'FolderTree' },
      { path: '/group-buying', label: 'sidebar.groupBuying', icon: 'Users2' },
      { path: '/inventory', label: 'sidebar.inventory', icon: 'Warehouse' },
    ],
  },
];
