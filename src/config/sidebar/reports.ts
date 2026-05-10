/**
 * Reports topbar module — analytics routes under /reports.
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.reports',
    items: [
      { path: '/reports', label: 'report.dashboard', icon: 'BarChart3' },
      { path: '/reports/sales-overview', label: 'report.sales_overview', icon: 'FileText' },
      { path: '/reports/auction-performance', label: 'report.auction_performance', icon: 'Gavel' },
      { path: '/reports/customer-insights', label: 'report.customer_insights', icon: 'Users' },
      { path: '/reports/group-buying-analytics', label: 'report.group_buying_analytics', icon: 'Users2' },
    ],
  },
];
