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
      { path: '/group-buying', label: 'sidebar.groupBuying', icon: 'Users2' },
    ]
  },
  {
    title: 'sidebar.sales_department',
    items: [
      { path: '/customers', label: 'customer.title', icon: 'Users' },
      { path: '/orders', label: 'order.title', icon: 'ShoppingCart' },
    ]
  },
  {
    title: 'sidebar.reports',
    items: [
      { path: '/reports/sales-overview', label: 'report.sales_overview_section', icon: 'BarChart3' },
      { path: '/reports/auction-performance', label: 'report.auction_performance', icon: 'TrendingUp' },
      { path: '/reports/group-buying-analytics', label: 'report.group_buying_analytics', icon: 'FileText' },
      { path: '/reports/customer-insights', label: 'report.customer_insights', icon: 'Users' },
    ]
  },
  {
    title: 'sidebar.management',
    items: [
      { path: '/inventory', label: 'sidebar.inventory', icon: 'Warehouse' },
      { path: '/users', label: 'sidebar.users', icon: 'UserCog' },
      { path: '/settings', label: 'sidebar.settings', icon: 'Settings' },
    ]
  }
];
