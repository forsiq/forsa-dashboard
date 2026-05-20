import { RoleGuard } from '@core/components/RoleGuard';
import { ApprovalQueuePage } from '@features/moderation/pages/ApprovalQueuePage';

export default function Moderation() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <ApprovalQueuePage />
    </RoleGuard>
  );
}
