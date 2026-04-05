/**
 * Items Feature Routes
 */

import { ItemsListPage } from './pages/ItemsListPage';
import { ItemFormPage } from './pages/ItemFormPage';

// Routes for items feature
const itemsRoutes = [
  {
    path: '/items',
    element: <ItemsListPage />,
  },
  {
    path: '/items/add',
    element: <ItemFormPage />,
  },
  {
    path: '/items/edit/:id',
    element: <ItemFormPage />,
  },
];

export default itemsRoutes;
export { itemsRoutes };
