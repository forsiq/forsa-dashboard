import { RoleGuard } from '@core/components/RoleGuard';
import { CategoryEditPage } from '@services/categories/pages/CategoryEditPage';

export default function EditCategoryPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant']}>
      <CategoryEditPage />
    </RoleGuard>
  );
}
