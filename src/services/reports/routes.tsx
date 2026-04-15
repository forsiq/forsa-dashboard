import { RouteObject } from 'react-router-dom';
import { ReportsPage } from './pages/ReportsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SalesReportPage } from './pages/SalesReportPage';
import { CustomerInsightsPage } from './pages/CustomerInsightsPage';

const reportsRoutes: RouteObject[] = [
  { path: '/reports', element: <ReportsPage /> },
  { path: '/reports/sales-overview', element: <ReportsPage /> },
  { path: '/reports/auction-performance', element: <AnalyticsPage /> },
  { path: '/reports/group-buying-analytics', element: <SalesReportPage /> },
  { path: '/reports/customer-insights', element: <CustomerInsightsPage /> },
];

export default reportsRoutes;
