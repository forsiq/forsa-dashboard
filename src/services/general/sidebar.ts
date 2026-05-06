/**
 * General Service Sidebar Configuration
 * This is the DEFAULT/MAIN sidebar with all menu items
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.general',
    items: [
      { path: '/dashboard', label: 'sidebar.dashboard', icon: 'Activity' },
      { path: '/live-monitor', label: 'sidebar.live_monitor', icon: 'Radio' },
      { path: '/users', label: 'sidebar.users', icon: 'UserCog' },
      { path: '/settings', label: 'sidebar.settings', icon: 'Settings' },
    ]
  },
  {
    title: 'sidebar.operations',
    items: [
      { path: '/settlements', label: 'sidebar.settlements', icon: 'Landmark' },
      { path: '/moderation', label: 'sidebar.moderation', icon: 'Shield' },
    ]
  },
  {
    title: 'sidebar.auctions',
    items: [
      { path: '/auctions', label: 'sidebar.auctions', icon: 'Gavel' },
      { path: '/listings', label: 'sidebar.listings', icon: 'Package' },
      { path: '/categories', label: 'sidebar.categories', icon: 'FolderTree' },
      { path: '/group-buying', label: 'sidebar.groupBuying', icon: 'Users2' },
    ]
  },
  {
    title: 'sidebar.inventory',
    items: [
      { path: '/inventory', label: 'sidebar.inventory', icon: 'Warehouse' },
    ]
  },
  {
    title: 'sidebar.sales',
    items: [
      { path: '/orders', label: 'order.title', icon: 'ShoppingCart' },
      { path: '/customers', label: 'customer.title', icon: 'Users' },
    ]
  },
];
