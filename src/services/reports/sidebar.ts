/**
 * Reports Service Sidebar Configuration
 */

import type { MenuSection } from '@config/navigation';

export const sidebarSections: MenuSection[] = [
  {
    title: 'sidebar.reports',
    items: [
      { path: '/reports', label: 'report.dashboard', icon: 'BarChart3' },
      { path: '/reports/analytics', label: 'report.analytics', icon: 'TrendingUp' },
      { path: '/reports/sales', label: 'report.sales', icon: 'FileText' },
      { path: '/reports/inventory', label: 'report.inventory', icon: 'Package' },
    ],
  },
];
