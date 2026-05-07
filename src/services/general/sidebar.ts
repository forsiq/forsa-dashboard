/**
 * General Service Sidebar Configuration
 * Merged from 8 sections into 5 for better UX
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  // 1. Dashboard (Dashboards + Operations)
  {
    title: 'sidebar.dashboard',
    items: [
      { path: '/dashboard', label: 'sidebar.dashboard', icon: 'Activity' },
      { path: '/live-monitor', label: 'sidebar.live_monitor', icon: 'Radio' },
      { path: '/settlements', label: 'sidebar.settlements', icon: 'Landmark' },
      { path: '/moderation', label: 'sidebar.moderation', icon: 'Shield' },
    ]
  },
  // 2. Marketplace (Auctions + Catalog)
  {
    title: 'sidebar.marketplace',
    items: [
      { path: '/auctions', label: 'sidebar.auctions', icon: 'Gavel' },
      { path: '/listings', label: 'sidebar.listings', icon: 'Package' },
      { path: '/categories', label: 'sidebar.categories', icon: 'FolderTree' },
      { path: '/group-buying', label: 'sidebar.groupBuying', icon: 'Users2' },
    ]
  },
  // 3. Commerce (Sales + Customers)
  {
    title: 'sidebar.commerce',
    items: [
      { path: '/orders', label: 'order.title', icon: 'ShoppingCart' },
      { path: '/customers', label: 'customer.title', icon: 'Users' },
    ]
  },
  // 4. Management (Inventory + Users)
  {
    title: 'sidebar.management',
    items: [
      { path: '/inventory', label: 'sidebar.inventory', icon: 'Warehouse' },
      { path: '/users', label: 'sidebar.users', icon: 'UserCog' },
    ]
  },
  // 5. Settings
  {
    title: 'sidebar.settings_section',
    items: [
      { path: '/settings', label: 'sidebar.settings', icon: 'Settings' },
    ]
  },
];
