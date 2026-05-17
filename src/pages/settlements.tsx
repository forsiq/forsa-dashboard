import dynamic from 'next/dynamic';
import { ListPageSkeleton } from '@core/loading';

const SettlementDeskPage = dynamic(
  () => import('@features/dashboard/pages/SettlementDeskPage').then(mod => ({ default: mod.SettlementDeskPage })),
  {
    ssr: false,
    loading: () => <ListPageSkeleton count={6} columns={3} />,
  },
);

export default function Settlements() {
  return <SettlementDeskPage />;
}
