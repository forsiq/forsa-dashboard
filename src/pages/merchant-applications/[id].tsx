import { useRouter } from 'next/router';
import { RoleGuard } from '@core/components/RoleGuard';
import { DetailPageSkeleton } from '@core/loading';
import { ApplicationDetailPage } from '@features/merchant-applications/pages/ApplicationDetailPage';

export default function MerchantApplicationDetailRoute() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <RoleGuard allowedRoles={['admin']}>
      {id ? <ApplicationDetailPage id={String(id)} /> : <DetailPageSkeleton />}
    </RoleGuard>
  );
}
