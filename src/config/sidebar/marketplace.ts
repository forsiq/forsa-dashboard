/**
 * Marketplace topbar module — auctions, catalog, engagement, inventory.
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.sales_channels',
    items: [
      { path: '/auctions', label: 'sidebar.auctions', icon: 'Gavel' },
      { path: '/group-buying', label: 'sidebar.groupBuying', icon: 'Users2' },
    ],
  },
  {
    title: 'sidebar.products',
    items: [
      { path: '/listings', label: 'sidebar.listings', icon: 'Package' },
      { path: '/amazon-import', label: 'sidebar.amazon_import', icon: 'ShoppingBag' },
      { path: '/categories', label: 'sidebar.categories', icon: 'FolderTree' },
    ],
  },
  {
    title: 'sidebar.engagement',
    items: [{ path: '/watchlist', label: 'sidebar.watchlist', icon: 'Eye' }],
  },
  {
    title: 'sidebar.inventory_heading',
    items: [{ path: '/inventory', label: 'sidebar.inventory', icon: 'Warehouse' }],
  },
];
