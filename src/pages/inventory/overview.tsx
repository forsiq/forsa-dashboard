import { RoleGuard } from '@core/components/RoleGuard';
import { InventoryOverviewPage } from '../../services/inventory/pages/InventoryOverviewPage';

export default function InventoryOverview() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant']}>
      <InventoryOverviewPage />
    </RoleGuard>
  );
}
