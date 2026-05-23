import { RoleGuard } from '@core/components/RoleGuard';
import { ProductEditPage } from '../../../services/inventory/pages/ProductEditPage';

export default function EditProductPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant']}>
      <ProductEditPage />
    </RoleGuard>
  );
}
