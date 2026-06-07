import { RoleGuard } from '@core/components/RoleGuard';
import { ListingWizardPage } from '../../../features/listings/pages/ListingWizardPage';

export default function PublishListingPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant']}>
      <ListingWizardPage mode="publish-only" />
    </RoleGuard>
  );
}
