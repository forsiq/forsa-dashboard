import { RouteObject } from 'react-router-dom';
import { OrdersListPage } from './pages/OrdersListPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { OrderFormPage } from './pages/OrderFormPage';

export const ordersRoutes: RouteObject[] = [
  {
    path: '/orders',
    element: <OrdersListPage />
  },
  {
    path: '/orders/new',
    element: <OrderFormPage />
  },
  {
    path: '/orders/:id',
    element: <OrderDetailPage />
  },
  {
    path: '/orders/:id/edit',
    element: <OrderFormPage />
  }
];
