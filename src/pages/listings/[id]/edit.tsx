import { RoleGuard } from '@core/components/RoleGuard';
import { ListingEntryPage } from '../../../features/listings/pages/ListingEntryPage';

export default function EditListingPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant']}>
      <ListingEntryPage mode="edit" />
    </RoleGuard>
  );
}
