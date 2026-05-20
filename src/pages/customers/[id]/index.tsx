import { RoleGuard } from '@core/components/RoleGuard';
import { CustomerDetailPage } from '../../../services/customers/pages/CustomerDetailPage';

export default function CustomerDetailIndexPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'customer_support']}>
      <CustomerDetailPage />
    </RoleGuard>
  );
}
