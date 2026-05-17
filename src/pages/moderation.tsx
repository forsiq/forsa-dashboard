import dynamic from 'next/dynamic';
import { ListPageSkeleton } from '@core/loading';

const ModerationHubPage = dynamic(
  () => import('@features/dashboard/pages/ModerationHubPage').then(mod => ({ default: mod.ModerationHubPage })),
  {
    ssr: false,
    loading: () => <ListPageSkeleton count={4} columns={2} />,
  },
);

export default function Moderation() {
  return <ModerationHubPage />;
}
