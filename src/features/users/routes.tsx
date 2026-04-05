/**
 * User Feature Routes
 */

import { RouteObject } from 'react-router-dom';
import { UsersListPage } from './pages/UsersListPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { UserFormPage } from './pages/UserFormPage';

// Export routes as default for dynamic import
const userRoutes: RouteObject[] = [
  {
    path: '/users',
    element: <UsersListPage />,
  },
  {
    path: '/users/new',
    element: <UserFormPage />,
  },
  {
    path: '/users/:id',
    element: <UserDetailPage />,
  },
  {
    path: '/users/:id/edit',
    element: <UserFormPage />,
  },
];

export default userRoutes;
export { userRoutes };

// Export pages individually
export { default as UsersListPage } from './pages/UsersListPage';
export { default as UserDetailPage } from './pages/UserDetailPage';
export { default as UserFormPage } from './pages/UserFormPage';
