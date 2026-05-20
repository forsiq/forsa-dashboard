import { RoleGuard } from '@core/components/RoleGuard';
import { CustomersPage } from '../../services/customers/pages/CustomersPage';

export default function CustomersIndexPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'customer_support']}>
      <CustomersPage />
    </RoleGuard>
  );
}
