import dynamic from 'next/dynamic';
import { DetailPageSkeleton } from '@core/loading';

const GroupBuyingDetailPage = dynamic(
  () => import('../../features/sales/pages/GroupBuyingDetailPage').then(mod => ({ default: mod.GroupBuyingDetailPage })),
  {
    ssr: false,
    loading: () => <DetailPageSkeleton />,
  },
);

export default function GroupBuyingDetailWrapper() {
  return <GroupBuyingDetailPage />;
}
