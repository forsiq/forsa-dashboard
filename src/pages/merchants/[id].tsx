import { RoleGuard } from '@core/components/RoleGuard';
import { MerchantDetailPage } from '@features/merchants/pages/MerchantDetailPage';

export default function MerchantDetailPageRoute() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <MerchantDetailPage />
    </RoleGuard>
  );
}
