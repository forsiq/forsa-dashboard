import { RoleGuard } from '@core/components/RoleGuard';
import dynamic from 'next/dynamic';
import { ListPageSkeleton } from '@core/loading';

const LiveMonitorPage = dynamic(
  () => import('@features/dashboard/pages/LiveMonitorPage').then(mod => ({ default: mod.LiveMonitorPage })),
  {
    ssr: false,
    loading: () => <ListPageSkeleton count={6} columns={3} />,
  },
);

export default function LiveMonitor() {
  return (
    <RoleGuard allowedRoles={['admin', 'product_analyst']}>
      <LiveMonitorPage />
    </RoleGuard>
  );
}
