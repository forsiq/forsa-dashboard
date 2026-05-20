import { RoleGuard } from '@core/components/RoleGuard';
import { CategoryAddPage } from '@services/categories/pages/CategoryAddPage';

export default function NewCategoryPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <CategoryAddPage />
    </RoleGuard>
  );
}
