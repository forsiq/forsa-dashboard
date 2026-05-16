import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Gavel, Users } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberSlideOver } from '@core/components/AmberSlideOver';
import { AmberButton } from '@core/components/AmberButton';
import type { ProductListing } from '../../../types/services/listings.types';

type DeployType = 'auction' | 'group-buy';

interface QuickDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ProductListing | null;
  initialType?: DeployType;
}

export function QuickDeployModal({
  isOpen,
  onClose,
  listing,
  initialType = 'auction',
}: QuickDeployModalProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [deployType, setDeployType] = useState<DeployType>(initialType);

  const openWizard = () => {
    if (!listing) return;
    onClose();
    router.push(`/listings/${listing.id}/publish?type=${deployType}`);
  };

  return (
    <AmberSlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={t('listing.quick_deploy.title') || 'Quick Deploy'}
      description={
        listing
          ? `${t('listing.quick_deploy.deploying') || 'Deploying'}: ${listing.title}`
          : t('listing.quick_deploy.select_listing') || 'Select a listing first'
      }
      footer={
        <div className="flex gap-3">
          <AmberButton
            variant="ghost"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl font-bold"
          >
            {t('common.cancel') || 'Cancel'}
          </AmberButton>
          <AmberButton
            className="flex-1 h-11 bg-brand text-black font-black rounded-xl gap-2"
            onClick={openWizard}
            disabled={!listing}
          >
            {deployType === 'auction' ? (
              <Gavel className="w-4 h-4" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            {t('listing.wizard.next') || 'Continue'}
          </AmberButton>
        </div>
      }
    >
      {!listing ? (
        <p className="text-sm text-zinc-muted text-center py-8">
          {t('listing.quick_deploy.select_listing') || 'Please select a listing to deploy.'}
        </p>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-2 p-1 bg-obsidian-panel rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setDeployType('auction')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                deployType === 'auction'
                  ? 'bg-brand/15 text-brand border border-brand/30'
                  : 'text-zinc-muted hover:text-zinc-text'
              }`}
            >
              <Gavel className="w-3.5 h-3.5" />
              {t('auction.title') || 'Auction'}
            </button>
            <button
              type="button"
              onClick={() => setDeployType('group-buy')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                deployType === 'group-buy'
                  ? 'bg-brand/15 text-brand border border-brand/30'
                  : 'text-zinc-muted hover:text-zinc-text'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              {t('group_buying.title') || 'Group Buy'}
            </button>
          </div>
          <p className="text-[11px] text-zinc-muted font-bold">
            {t('listing.wizard.review_publish_note')}
          </p>
        </div>
      )}
    </AmberSlideOver>
  );
}
