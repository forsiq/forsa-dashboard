import { RoleGuard } from '@core/components/RoleGuard';
import { AuctionFormPage } from '@features/auctions/pages/AuctionFormPage';

export default function EditAuctionPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant']}>
      <AuctionFormPage />
    </RoleGuard>
  );
}
