import { RouteObject } from 'react-router-dom';
import { InventoryPage } from './pages/InventoryPage';
import { ProductAddPage } from './pages/ProductAddPage';

export const inventoryRoutes: RouteObject[] = [
  {
    path: '/inventory',
    element: <InventoryPage />,
  },
  {
    path: '/inventory/add',
    element: <ProductAddPage />,
  },
  {
    path: '/inventory/edit/:id',
    element: <ProductAddPage />,
  }
];
