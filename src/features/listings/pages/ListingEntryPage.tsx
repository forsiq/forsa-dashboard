import React from 'react';
import { useRouter } from 'next/router';
import { AmberFormSkeleton } from '@core/components/Loading/AmberFormSkeleton';
import { useLanguage } from '@core/contexts/LanguageContext';
import { ListingWizardPage } from './ListingWizardPage';
import { ListingFormPage } from './ListingFormPage';

interface ListingEntryPageProps {
  mode?: 'create' | 'edit';
}

export const ListingEntryPage: React.FC<ListingEntryPageProps> = ({ mode = 'create' }) => {
  const router = useRouter();
  const { t } = useLanguage();
  const formMode = router.query.mode === 'form' ? 'form' : 'wizard';

  if (!router.isReady) {
    return (
      <div className="space-y-4 p-6 max-w-[1200px] mx-auto">
        <p className="text-sm text-zinc-muted font-bold">{t('listing.wizard.preparing')}</p>
        <AmberFormSkeleton fields={6} header actions layout="grid" />
      </div>
    );
  }

  if (formMode === 'form') {
    return <ListingFormPage />;
  }

  return <ListingWizardPage mode={mode} />;
};

export default ListingEntryPage;
