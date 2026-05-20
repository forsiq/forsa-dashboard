import { RoleGuard } from '@core/components/RoleGuard';
import { OrderDetailPage } from '../../services/orders/pages/OrderDetailPage';

export default function OrderDetailsPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant', 'customer_support']}>
      <OrderDetailPage />
    </RoleGuard>
  );
}
