import { RoleGuard } from '@core/components/RoleGuard';
import { AuctionPerformancePage } from '@services/reports/pages/AuctionPerformancePage';

export default function AuctionPerformanceReport() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant', 'product_analyst']}>
      <AuctionPerformancePage />
    </RoleGuard>
  );
}
