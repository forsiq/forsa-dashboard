import { RouteObject } from 'react-router-dom';
import { ExampleListPage } from './pages/ExampleListPage';
import { ExampleDetailPage } from './pages/ExampleDetailPage';
import { ExampleFormPage } from './pages/ExampleFormPage';
import { ExampleSettingsPage } from './pages/ExampleSettingsPage';

export const exampleRoutes: RouteObject[] = [
  {
    path: '/example',
    element: <ExampleListPage />
  },
  {
    path: '/example/new',
    element: <ExampleFormPage />
  },
  {
    path: '/example/:id',
    element: <ExampleDetailPage />
  },
  {
    path: '/example/:id/edit',
    element: <ExampleFormPage />
  },
  {
    path: '/example/settings',
    element: <ExampleSettingsPage />
  }
];
