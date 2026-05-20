import { RoleGuard } from '@core/components/RoleGuard';
import { CustomerFormPage } from '../../services/customers/pages/CustomerFormPage';

export default function CustomerNewPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'customer_support']}>
      <CustomerFormPage />
    </RoleGuard>
  );
}
