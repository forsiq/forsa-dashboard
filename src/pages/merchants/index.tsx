import { RoleGuard } from '@core/components/RoleGuard';
import { MerchantsListPage } from '@features/merchants/pages/MerchantsListPage';

export default function MerchantsIndexPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <MerchantsListPage />
    </RoleGuard>
  );
}
