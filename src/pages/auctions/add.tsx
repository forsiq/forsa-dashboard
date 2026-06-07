import { useState } from 'react';
import { useRouter } from 'next/router';
import { RoleGuard } from '@core/components/RoleGuard';
import { Gavel, List, Package, Plus, PenLine, Loader2 } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useDashboardRole } from '@core/hooks/useDashboardRole';
import { AmberButton } from '@core/components/AmberButton';
import { AmberCard } from '@core/components/AmberCard';
import { cn } from '@core/lib/utils/cn';
import { FlowConceptBanner } from '../../features/listings/components/FlowConceptBanner';
import { InventoryProductPickerModal } from '../../features/listings/components/InventoryProductPickerModal';
import {
  useCreateListing,
  useSubmitListingForReview,
} from '../../features/listings/api/listing-hooks';
import { buildCreateListingInputFromInventory } from '../../features/listings/utils/mapInventoryProductToListing';
import type { NormalizedInventoryProduct } from '../../features/listings/utils/mapInventoryProductToListing';

export default function AuctionAddPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'merchant']}>
      <AuctionAddPageContent />
    </RoleGuard>
  );
}

function AuctionAddPageContent() {
  const router = useRouter();
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const { isTrustedMerchant } = useDashboardRole();
  const [showInventoryPicker, setShowInventoryPicker] = useState(false);
  const [isCreatingFromInventory, setIsCreatingFromInventory] = useState(false);

  const createMutation = useCreateListing();
  const submitMutation = useSubmitListingForReview();

  const handleInventorySelect = async (product: NormalizedInventoryProduct) => {
    setIsCreatingFromInventory(true);
    try {
      const payload = buildCreateListingInputFromInventory(product);
      const created = await createMutation.mutateAsync(payload);
      if (isTrustedMerchant) {
        await submitMutation.mutateAsync({ id: created.id, mode: 'direct' });
        await router.push(`/listings/${created.id}/publish?type=auction`);
      } else {
        await router.push(`/listings/${created.id}/edit`);
      }
    } catch {
      // Toast handled by mutation hooks
    } finally {
      setIsCreatingFromInventory(false);
    }
  };

  const isBusy =
    isCreatingFromInventory || createMutation.isPending || submitMutation.isPending;

  return (
    <div
      className="max-w-2xl mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
      dir={dir}
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-brand/10 rounded-2xl flex items-center justify-center border border-brand/20">
            <Gavel className="w-10 h-10 text-brand" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-zinc-text tracking-tight uppercase">
          {t('auction.create.title')}
        </h1>
        <p className="text-sm font-medium text-zinc-muted max-w-[440px] mx-auto leading-relaxed">
          {t('auction.create.flow_desc')}
        </p>
      </div>

      <FlowConceptBanner messageKey="auction.create.concept_overview" />

      <div className="space-y-4">
        <AmberCard className="p-6 bg-obsidian-card border-brand/20 shadow-xl ring-1 ring-brand/10">
          <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-brand" />
            </div>
            <div className="flex-1 min-w-0 text-start">
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('auction.create.from_inventory_title')}
              </h3>
              <p className="text-[13px] text-zinc-muted mt-1">
                {t('auction.create.from_inventory_desc')}
              </p>
            </div>
            <AmberButton
              className="shrink-0 h-10 bg-brand text-black font-bold uppercase tracking-wider rounded-xl px-6 hover:bg-brand/90 active:scale-95 transition-all border-none text-xs gap-1.5"
              disabled={isBusy}
              onClick={() => setShowInventoryPicker(true)}
            >
              {isBusy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Package className="w-3.5 h-3.5" />
              )}
              {t('auction.create.from_inventory_action')}
            </AmberButton>
          </div>
        </AmberCard>

        <AmberCard className="p-6 bg-obsidian-card border-border shadow-xl">
          <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
              <List className="w-5 h-5 text-info" />
            </div>
            <div className="flex-1 min-w-0 text-start">
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('auction.create.from_catalog_title')}
              </h3>
              <p className="text-[13px] text-zinc-muted mt-1">
                {t('auction.create.from_catalog_desc')}
              </p>
            </div>
            <AmberButton
              variant="secondary"
              className="shrink-0 h-10 font-bold uppercase tracking-wider rounded-xl px-6 active:scale-95 transition-all text-xs gap-1.5"
              onClick={() => void router.push('/listings')}
            >
              <List className="w-3.5 h-3.5" />
              {t('auction.create.view_listings')}
            </AmberButton>
          </div>
        </AmberCard>

        <AmberCard className="p-6 bg-obsidian-card border-border shadow-xl">
          <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <PenLine className="w-5 h-5 text-zinc-muted" />
            </div>
            <div className="flex-1 min-w-0 text-start">
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('auction.create.manual_title')}
              </h3>
              <p className="text-[13px] text-zinc-muted mt-1">
                {t('auction.create.manual_desc')}
              </p>
            </div>
            <AmberButton
              variant="outline"
              className="shrink-0 h-10 font-bold uppercase tracking-wider rounded-xl px-6 active:scale-95 transition-all text-xs gap-1.5 border-border"
              onClick={() => void router.push('/listings/new')}
            >
              <Plus className="w-3.5 h-3.5" />
              {t('auction.create.new_listing')}
            </AmberButton>
          </div>
        </AmberCard>
      </div>

      <div className="pt-2 text-center">
        <AmberButton
          variant="outline"
          className="font-bold uppercase tracking-wider text-xs gap-2 h-10"
          onClick={() => void router.push('/auctions')}
        >
          {t('common.back')}
        </AmberButton>
      </div>

      <InventoryProductPickerModal
        isOpen={showInventoryPicker}
        onClose={() => setShowInventoryPicker(false)}
        onSelect={(product) => void handleInventorySelect(product)}
        descriptionKey="listing.wizard.pick_from_inventory_publish_desc"
      />
    </div>
  );
}
