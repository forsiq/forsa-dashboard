import { RoleGuard } from '@core/components/RoleGuard';
import { ReviewsListPage } from '@features/feedback/pages/ReviewsListPage';

export default function FeedbackReviewsRoute() {
  return (
    <RoleGuard allowedRoles={['admin', 'customer_support']}>
      <ReviewsListPage />
    </RoleGuard>
  );
}
