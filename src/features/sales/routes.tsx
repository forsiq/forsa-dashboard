/**
 * Sales Feature Routes
 *
 * Routes for group buying functionality
 */

import { RouteObject } from 'react-router-dom';
import { GroupBuyingListPage } from './pages/GroupBuyingListPage';
import { GroupBuyingDetailPage } from './pages/GroupBuyingDetailPage';
import { GroupBuyingFormPage } from './pages/GroupBuyingFormPage';
import { GroupBuyingReviewPage } from './pages/GroupBuyingReviewPage';

// Export routes as default for dynamic import
const salesRoutes: RouteObject[] = [
  {
    path: '/group-buying',
    element: <GroupBuyingListPage />,
  },
  {
    path: '/group-buying/new',
    element: <GroupBuyingFormPage />,
  },
  {
    path: '/group-buying/:id',
    element: <GroupBuyingDetailPage />,
  },
  {
    path: '/group-buying/:id/edit',
    element: <GroupBuyingFormPage />,
  },
  {
    path: '/group-buying/review',
    element: <GroupBuyingReviewPage />,
  },
];

export default salesRoutes;
export { salesRoutes };

// Export pages individually
export { default as GroupBuyingListPage } from './pages/GroupBuyingListPage';
export { default as GroupBuyingDetailPage } from './pages/GroupBuyingDetailPage';
export { default as GroupBuyingFormPage } from './pages/GroupBuyingFormPage';
export { default as GroupBuyingReviewPage } from './pages/GroupBuyingReviewPage';
