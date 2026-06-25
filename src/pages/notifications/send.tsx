import { RoleGuard } from '@core/components/RoleGuard';
import { SendNotificationPage } from '@services/notifications/pages/SendNotificationPage';

export default function SendNotificationRoute() {
  return (
    <RoleGuard allowedRoles={['admin', 'product_moderator', 'customer_support']}>
      <SendNotificationPage />
    </RoleGuard>
  );
}
