import { RoleGuard } from '@core/components/RoleGuard';
import { UsersListPage } from '../../features/users/pages/UsersListPage';

export default function UsersIndexPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <UsersListPage />
    </RoleGuard>
  );
}
