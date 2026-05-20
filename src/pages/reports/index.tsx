import { RoleGuard } from '@core/components/RoleGuard';
import { ReportsPage } from '@services/reports/pages/ReportsPage';

export default function ReportsIndex() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant', 'product_analyst', 'customer_support']}>
      <ReportsPage />
    </RoleGuard>
  );
}
