import dynamic from 'next/dynamic';
import { ListPageSkeleton } from '@core/loading';

const SalesReportPage = dynamic(
  () => import('@services/reports/pages/SalesReportPage').then(mod => ({ default: mod.SalesReportPage })),
  {
    ssr: false,
    loading: () => <ListPageSkeleton count={4} columns={2} />,
  },
);

export default function SalesReport() {
  return <SalesReportPage />;
}
