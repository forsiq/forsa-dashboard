import { RouteObject } from 'react-router-dom';
import { DashboardHomePage } from './pages/DashboardHomePage';

export const dashboardRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <DashboardHomePage />
  }
];
