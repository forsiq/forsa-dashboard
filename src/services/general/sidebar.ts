/**
 * General Service Sidebar Configuration
 * This is the DEFAULT/MAIN sidebar with all menu items
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.dashboards',
    items: [
      { path: '/dashboard', label: 'sidebar.dashboard', icon: 'Activity' },
    ]
  },
  {
    title: 'sidebar.catalog',
    items: [
      { path: '/categories', label: 'category.title', icon: 'FolderTree' },
      { path: '/auctions', label: 'sidebar.auctions', icon: 'Gavel' },
      { path: '/inventory', label: 'sidebar.auction_items', icon: 'Package' },
    ]
  },
  {
    title: 'sidebar.sales',
    items: [
      { path: '/customers', label: 'customer.title', icon: 'Users' },
      { path: '/orders', label: 'order.title', icon: 'ShoppingCart' },
      { path: '/group-buying', label: 'sidebar.groupBuying', icon: 'Users2' },
      { path: '/group-buying/review', label: 'sidebar.group_review', icon: 'ClipboardCheck' },
    ]
  },
  {
    title: 'sidebar.inventory',
    items: [
      { path: '/inventory', label: 'inventory.overview', icon: 'Package' },
      { path: '/inventory/add', label: 'inventory.add_item', icon: 'Plus' },
    ]
  },
  {
    title: 'sidebar.reports',
    items: [
      { path: '/reports', label: 'report.dashboard', icon: 'BarChart3' },
      { path: '/reports/analytics', label: 'report.analytics', icon: 'TrendingUp' },
      { path: '/reports/sales', label: 'report.sales', icon: 'FileText' },
    ]
  },
  {
    title: 'sidebar.general',
    items: [
      { path: '/settings', label: 'settings.page.title', icon: 'Settings' },
      { path: '/about', label: 'sidebar.about', icon: 'Info' },
    ]
  }
];
