import { RoleGuard } from '@core/components/RoleGuard';
import { createClientReportPage } from '@services/reports/utils/createClientReportPage';

const AuctionPerformancePage = createClientReportPage(() =>
  import('@services/reports/pages/AuctionPerformancePage').then((mod) => ({
    default: mod.AuctionPerformancePage,
  })),
);

export default function AuctionPerformanceReport() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant', 'product_analyst']}>
      <AuctionPerformancePage />
    </RoleGuard>
  );
}
