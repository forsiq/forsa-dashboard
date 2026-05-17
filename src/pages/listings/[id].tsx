import dynamic from 'next/dynamic';
import { DetailPageSkeleton } from '@core/loading';

const ListingDetailPage = dynamic(
  () => import('../../features/listings/pages/ListingDetailPage').then(mod => ({ default: mod.ListingDetailPage })),
  {
    ssr: false,
    loading: () => <DetailPageSkeleton />,
  },
);

export default ListingDetailPage;
