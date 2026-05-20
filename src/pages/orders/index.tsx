import { RoleGuard } from '@core/components/RoleGuard';
import { OrdersListPage } from '../../services/orders/pages/OrdersListPage';

export default function Orders() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant', 'customer_support']}>
      <OrdersListPage />
    </RoleGuard>
  );
}
