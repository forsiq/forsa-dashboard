import { RoleGuard } from '@core/components/RoleGuard';
import { ChangelogPage } from '@features/feedback/pages/ChangelogPage';

export default function FeedbackChangelogRoute() {
  return (
    <RoleGuard allowedRoles={['admin', 'customer_support']}>
      <ChangelogPage />
    </RoleGuard>
  );
}
