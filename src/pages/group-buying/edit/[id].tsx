import { RoleGuard } from '@core/components/RoleGuard';
import { GroupBuyingFormPage } from '../../../features/sales/pages/GroupBuyingFormPage';

export default function GroupBuyingEditPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <GroupBuyingFormPage />
    </RoleGuard>
  );
}
