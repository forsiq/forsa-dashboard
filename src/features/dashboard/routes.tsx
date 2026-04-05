import { RouteObject } from 'react-router-dom';
import { DashboardHomePage } from './pages/DashboardHomePage';

const dashboardRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <DashboardHomePage />
  }
];

export default dashboardRoutes;
