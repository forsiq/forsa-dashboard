import { RoleGuard } from '@core/components/RoleGuard';
import { PostsListPage } from '@features/feedback/pages/PostsListPage';

export default function FeedbackPostsRoute() {
  return (
    <RoleGuard allowedRoles={['admin', 'customer_support']}>
      <PostsListPage />
    </RoleGuard>
  );
}
