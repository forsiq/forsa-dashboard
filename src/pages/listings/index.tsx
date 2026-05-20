import { RoleGuard } from '@core/components/RoleGuard';
import { ListingsListPage } from '../../features/listings/pages/ListingsListPage';

export default function ListingsPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant']}>
      <ListingsListPage />
    </RoleGuard>
  );
}
