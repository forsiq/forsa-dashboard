import { RouteObject } from 'react-router-dom';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryAddPage } from './pages/CategoryAddPage';
import { CategoryEditPage } from './pages/CategoryEditPage';

// --- Categories Routes ---

const categoriesRoutes: RouteObject[] = [
  {
    path: '/categories',
    element: <CategoriesPage />,
  },
  {
    path: '/categories/new',
    element: <CategoryAddPage />,
  },
  {
    path: '/categories/:id/edit',
    element: <CategoryEditPage />,
  },
];

export default categoriesRoutes;
