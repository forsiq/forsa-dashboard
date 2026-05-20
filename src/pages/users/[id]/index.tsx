import { RoleGuard } from '@core/components/RoleGuard';
import { UserDetailPage } from '../../../features/users/pages/UserDetailPage';

export default function UserDetailIndexPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <UserDetailPage />
    </RoleGuard>
  );
}
