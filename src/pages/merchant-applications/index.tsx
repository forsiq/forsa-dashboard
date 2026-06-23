import { RoleGuard } from '@core/components/RoleGuard';
import { ApplicationsListPage } from '@features/merchant-applications/pages/ApplicationsListPage';

export default function MerchantApplicationsIndexPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <ApplicationsListPage />
    </RoleGuard>
  );
}
