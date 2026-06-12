import { RoleGuard } from '@core/components/RoleGuard';
import { createClientReportPage } from '@services/reports/utils/createClientReportPage';

const SalesReportPage = createClientReportPage(() =>
  import('@services/reports/pages/SalesReportPage').then((mod) => ({ default: mod.SalesReportPage })),
);

export default function SalesReport() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant', 'product_analyst', 'customer_support']}>
      <SalesReportPage />
    </RoleGuard>
  );
}
