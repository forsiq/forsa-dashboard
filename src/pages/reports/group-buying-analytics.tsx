import { RoleGuard } from '@core/components/RoleGuard';
import { GroupBuyingAnalyticsPage } from '@services/reports/pages/GroupBuyingAnalyticsPage';

export default function GroupBuyingAnalyticsReport() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant', 'product_analyst']}>
      <GroupBuyingAnalyticsPage />
    </RoleGuard>
  );
}
