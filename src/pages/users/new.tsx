import { RoleGuard } from '@core/components/RoleGuard';
import { UserFormPage } from '../../features/users/pages/UserFormPage';

export default function UserNewPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <UserFormPage />
    </RoleGuard>
  );
}
