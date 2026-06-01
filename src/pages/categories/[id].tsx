import { RoleGuard } from '@core/components/RoleGuard';
import { CategoryDetailPage } from '@services/categories/pages/CategoryDetailPage';

export default function CategoryDetail() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant', 'product_moderator']}>
      <CategoryDetailPage />
    </RoleGuard>
  );
}
