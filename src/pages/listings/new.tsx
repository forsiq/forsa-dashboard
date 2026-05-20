import { RoleGuard } from '@core/components/RoleGuard';
import { ListingEntryPage } from '../../features/listings/pages/ListingEntryPage';

export default function NewListingPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant']}>
      <ListingEntryPage mode="create" />
    </RoleGuard>
  );
}
