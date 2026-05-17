import dynamic from 'next/dynamic';
import { ListPageSkeleton } from '@core/loading';

const DashboardHomePage = dynamic(
  () => import('@features/dashboard/pages/DashboardHomePage').then(mod => ({ default: mod.DashboardHomePage })),
  {
    ssr: false,
    loading: () => <ListPageSkeleton count={6} columns={3} showStats />,
  },
);

export default function Dashboard() {
  return <DashboardHomePage />;
}
