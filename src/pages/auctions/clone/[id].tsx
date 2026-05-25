import { RoleGuard } from '@core/components/RoleGuard';
import { AuctionFormPage } from '@features/auctions/pages/AuctionFormPage';

export default function CloneAuctionPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AuctionFormPage />
    </RoleGuard>
  );
}
