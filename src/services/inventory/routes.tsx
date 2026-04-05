import { RouteObject } from 'react-router-dom';
import { InventoryOverviewPage } from './pages/InventoryOverviewPage';
import { ProductAddPage } from './pages/ProductAddPage';
import { InventoryPage } from './pages/InventoryPage';

const inventoryRoutes: RouteObject[] = [
  {
    path: '/inventory',
    element: <InventoryOverviewPage />,
  },
  {
    path: '/inventory/list',
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

export default inventoryRoutes;
