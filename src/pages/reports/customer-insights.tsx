import { RoleGuard } from '@core/components/RoleGuard';
import { CustomerInsightsPage } from '@services/reports/pages/CustomerInsightsPage';

export default function CustomerInsightsReport() {
  return (
    <RoleGuard allowedRoles={['admin', 'customer_support']}>
      <CustomerInsightsPage />
    </RoleGuard>
  );
}
