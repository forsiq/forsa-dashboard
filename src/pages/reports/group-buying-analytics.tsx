import { RoleGuard } from '@core/components/RoleGuard';
import dynamic from 'next/dynamic';
import { ListPageSkeleton } from '@core/loading';

const GroupBuyingAnalyticsPage = dynamic(
  () =>
    import('@services/reports/pages/GroupBuyingAnalyticsPage').then((mod) => ({
      default: mod.GroupBuyingAnalyticsPage,
    })),
  {
    ssr: false,
    loading: () => <ListPageSkeleton count={4} columns={2} />,
  },
);

export default function GroupBuyingAnalyticsReport() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant', 'product_analyst']}>
      <GroupBuyingAnalyticsPage />
    </RoleGuard>
  );
}
