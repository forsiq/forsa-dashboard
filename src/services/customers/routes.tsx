import { RouteObject } from 'react-router-dom';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { CustomerFormPage } from './pages/CustomerFormPage';

export const customersRoutes: RouteObject[] = [
  {
    path: '/customers',
    element: <CustomersPage />,
  },
  {
    path: '/customers/new',
    element: <CustomerFormPage />,
  },
  {
    path: '/customers/:id',
    element: <CustomerDetailPage />,
  },
  {
    path: '/customers/:id/edit',
    element: <CustomerFormPage />,
  },
];
