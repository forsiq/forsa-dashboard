import dynamic from 'next/dynamic';
import { ListPageSkeleton } from '@core/loading';

const EngagementPage = dynamic(
  () => import('@features/dashboard/pages/EngagementPage').then(mod => ({ default: mod.EngagementPage })),
  {
    ssr: false,
    loading: () => <ListPageSkeleton count={4} columns={2} showStats />,
  },
);

export default function Engagement() {
  return <EngagementPage />;
}
