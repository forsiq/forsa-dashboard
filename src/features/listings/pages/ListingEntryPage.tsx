import React from 'react';
import { useRouter } from 'next/router';
import { ListingWizardPage } from './ListingWizardPage';
import { ListingFormPage } from './ListingFormPage';

interface ListingEntryPageProps {
  mode?: 'create' | 'edit';
}

export const ListingEntryPage: React.FC<ListingEntryPageProps> = ({ mode = 'create' }) => {
  const router = useRouter();
  const formMode = router.query.mode === 'form' ? 'form' : 'wizard';

  if (!router.isReady) return null;

  if (formMode === 'form') {
    return <ListingFormPage />;
  }

  return <ListingWizardPage mode={mode} />;
};

export default ListingEntryPage;
