import { RoleGuard } from '@core/components/RoleGuard';
import { ProductAddPage } from '../../services/inventory/pages/ProductAddPage';

export default function InventoryNew() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant']}>
      <ProductAddPage />
    </RoleGuard>
  );
}
