import { RoleGuard } from '@core/components/RoleGuard';
import { CategoriesPage } from '@services/categories/pages/CategoriesPage';

export default function CategoriesIndex() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant', 'product_moderator']}>
      <CategoriesPage />
    </RoleGuard>
  );
}
