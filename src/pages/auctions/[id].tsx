import dynamic from 'next/dynamic';
import { DetailPageSkeleton } from '@core/loading';

const AuctionDetails = dynamic(
  () => import('@features/auctions/pages/AuctionDetails').then(mod => ({ default: mod.AuctionDetails })),
  {
    ssr: false,
    loading: () => <DetailPageSkeleton />,
  },
);

export default function AuctionDetailsPage() {
  return <AuctionDetails />;
}
