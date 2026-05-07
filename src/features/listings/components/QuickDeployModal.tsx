import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Gavel, Users, Loader2 } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberSlideOver } from '@core/components/AmberSlideOver';
import { AmberButton } from '@core/components/AmberButton';
import { FormBuilder } from '@core/components/Form/FormBuilder';
import { useCreateAuction } from '../../auctions/api';
import type { FormFieldConfig } from '@core/services/types';
import type { ProductListing } from '../../../types/services/listings.types';

type DeployType = 'auction' | 'group-buy';

interface QuickDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ProductListing | null;
  initialType?: DeployType;
}

export function QuickDeployModal({ isOpen, onClose, listing, initialType = 'auction' }: QuickDeployModalProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const createAuctionMutation = useCreateAuction();
  const [deployType, setDeployType] = useState<DeployType>(initialType);

  const auctionFields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'startPrice',
      label: t('auction.form.fields.start_price') || 'Start Price',
      type: 'number',
      required: true,
      validation: { min: 1, custom: (v) => Number(v) > 0 ? undefined : 'Price must be greater than 0' },
    },
    {
      name: 'durationDays',
      label: t('auction.form.cycle_duration') || 'Duration (Days)',
      type: 'number',
      required: true,
      defaultValue: 7,
      validation: { min: 1, max: 90 },
    },
  ], [t]);

  const groupBuyFields: FormFieldConfig[] = useMemo(() => [
    {
      name: 'dealPrice',
      label: t('group_buying.deal_price') || 'Deal Price',
      type: 'number',
      required: true,
      validation: { min: 1 },
    },
    {
      name: 'minParticipants',
      label: t('group_buying.min_participants') || 'Min Participants',
      type: 'number',
      required: true,
      defaultValue: 5,
      validation: { min: 2, max: 1000 },
    },
  ], [t]);

  const fields = deployType === 'auction' ? auctionFields : groupBuyFields;

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!listing) return;

    try {
      if (deployType === 'auction') {
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 1, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setDate(endTime.getDate() + (Number(data.durationDays) || 7));

        await createAuctionMutation.mutateAsync({
          title: listing.title,
          description: listing.description,
          startPrice: Number(data.startPrice),
          categoryId: listing.categoryId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          images: listing.images || [],
        } as any);
      }
      // Group buying would use a separate mutation when available

      onClose();
      router.push(deployType === 'auction' ? '/auctions' : '/group-buying');
    } catch {
      // Error handled by mutation
    }
  };

  const isSubmitting = createAuctionMutation.isPending;

  return (
    <AmberSlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={t('listing.quick_deploy.title') || 'Quick Deploy'}
      description={listing
        ? `${t('listing.quick_deploy.deploying') || 'Deploying'}: ${listing.title}`
        : (t('listing.quick_deploy.select_listing') || 'Select a listing first')
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
            onClick={() => {
              const form = document.querySelector('form');
              if (form) form.requestSubmit();
            }}
            disabled={isSubmitting || !listing}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : deployType === 'auction' ? (
              <Gavel className="w-4 h-4" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            {deployType === 'auction'
              ? (t('listing.quick_deploy.deploy_auction') || 'Deploy Auction')
              : (t('listing.quick_deploy.deploy_deal') || 'Deploy Deal')
            }
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
          {/* Deploy Type Toggle */}
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

          {/* Dynamic Form */}
          <FormBuilder
            key={deployType} // Re-mount on type change to reset
            fields={fields}
            initialValues={
              deployType === 'auction'
                ? { startPrice: '', durationDays: '7' }
                : { dealPrice: '', minParticipants: '5' }
            }
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            showActions={false}
          />
        </div>
      )}
    </AmberSlideOver>
  );
}
