import { RoleGuard } from '@core/components/RoleGuard';
import { GroupBuyingFormPage } from '../../features/sales/pages/GroupBuyingFormPage';

export default function GroupBuyingNewPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant']}>
      <GroupBuyingFormPage />
    </RoleGuard>
  );
}
