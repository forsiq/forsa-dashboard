import dynamic from 'next/dynamic';
import { RoleGuard } from '@core/components/RoleGuard';
import { DetailPageSkeleton } from '@core/loading';

const ProductDetailPage = dynamic(
  () => import('../../services/inventory/pages/ProductDetailPage').then(mod => ({ default: mod.ProductDetailPage })),
  {
    ssr: false,
    loading: () => <DetailPageSkeleton />,
  },
);

export default function ProductDetail() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant']}>
      <ProductDetailPage />
    </RoleGuard>
  );
}
