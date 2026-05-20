import { RoleGuard } from '@core/components/RoleGuard';
import { InventoryPage } from '../../services/inventory/pages/InventoryPage';

export default function Inventory() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant']}>
      <InventoryPage />
    </RoleGuard>
  );
}
