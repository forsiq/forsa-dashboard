/**
 * _core Feature Routes
 *
 * Core routes that are always available regardless of feature configuration.
 * These include error pages and foundational routing.
 */

import { RouteObject } from 'react-router-dom';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ServerErrorPage } from '../pages/ServerErrorPage';
import { NetworkErrorPage } from '../pages/NetworkErrorPage';

export const coreRoutes: RouteObject[] = [
  {
    path: '/error/500',
    element: <ServerErrorPage />
  },
  {
    path: '/error/network',
    element: <NetworkErrorPage />
  },
  // 404 is handled by the router, not as a named route
];
