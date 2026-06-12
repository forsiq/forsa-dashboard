import { RoleGuard } from '@core/components/RoleGuard';
import dynamic from 'next/dynamic';
import { ListPageSkeleton } from '@core/loading';

const AuctionPerformancePage = dynamic(
  () =>
    import('@services/reports/pages/AuctionPerformancePage').then((mod) => ({
      default: mod.AuctionPerformancePage,
    })),
  {
    ssr: false,
    loading: () => <ListPageSkeleton count={4} columns={2} />,
  },
);

export default function AuctionPerformanceReport() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant', 'product_analyst']}>
      <AuctionPerformancePage />
    </RoleGuard>
  );
}
