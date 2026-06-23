import { RoleGuard } from '@core/components/RoleGuard';
import { RoadmapPage } from '@features/feedback/pages/RoadmapPage';

export default function FeedbackRoadmapRoute() {
  return (
    <RoleGuard allowedRoles={['admin', 'customer_support']}>
      <RoadmapPage />
    </RoleGuard>
  );
}
