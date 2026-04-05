import { RouteObject } from 'react-router-dom';
import { ReportsPage } from './pages/ReportsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SalesReportPage } from './pages/SalesReportPage';

const reportsRoutes: RouteObject[] = [
  { path: '/reports', element: <ReportsPage /> },
  { path: '/reports/analytics', element: <AnalyticsPage /> },
  { path: '/reports/sales', element: <SalesReportPage /> },
];

export default reportsRoutes;
