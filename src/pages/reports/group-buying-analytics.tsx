import { RoleGuard } from '@core/components/RoleGuard';
import { createClientReportPage } from '@services/reports/utils/createClientReportPage';

const GroupBuyingAnalyticsPage = createClientReportPage(() =>
  import('@services/reports/pages/GroupBuyingAnalyticsPage').then((mod) => ({
    default: mod.GroupBuyingAnalyticsPage,
  })),
);

export default function GroupBuyingAnalyticsReport() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant', 'product_analyst']}>
      <GroupBuyingAnalyticsPage />
    </RoleGuard>
  );
}
