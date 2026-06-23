import { RoleGuard } from '@core/components/RoleGuard';
import { FeedbackOverviewPage } from '@features/feedback/pages/FeedbackOverviewPage';

export default function FeedbackOverviewRoute() {
  return (
    <RoleGuard allowedRoles={['admin', 'customer_support']}>
      <FeedbackOverviewPage />
    </RoleGuard>
  );
}
