import { Package, Gavel, Users } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import type { ProductListing } from '../../../types/services/listings.types';

type DeployChannel = 'auction' | 'group_buy' | null;

interface WizardChannelStepProps {
  t: (key: string) => string;
  isRTL: boolean;
  existingListing: ProductListing | undefined;
  wizardGalleryImages: string[];
  deployChannel: DeployChannel;
  setDeployChannel: (channel: DeployChannel) => void;
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onRouterPush: (path: string) => void;
}

export function WizardChannelStep({
  t,
  isRTL,
  existingListing,
  wizardGalleryImages,
  deployChannel,
  setDeployChannel,
  setFieldErrors,
  onRouterPush,
}: WizardChannelStepProps) {
  return (
    <div className="space-y-4">
      {existingListing && (
        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-obsidian-card',
            isRTL && 'flex-row-reverse',
          )}
        >
          <div className="w-14 h-14 rounded-lg bg-obsidian-panel border border-white/5 overflow-hidden shrink-0">
            {wizardGalleryImages[0] ? (
              <img
                src={wizardGalleryImages[0]}
                alt={existingListing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-5 h-5 text-zinc-muted/40" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
              {t('listing.flow.publish_listing_label')}
            </p>
            <p className="text-sm font-bold text-zinc-text truncate">{existingListing.title}</p>
          </div>
          <AmberButton
            variant="ghost"
            className="shrink-0 h-9 text-[11px] font-black uppercase tracking-wider text-brand"
            onClick={() => void onRouterPush('/auctions/add')}
          >
            {t('listing.flow.change_product')}
          </AmberButton>
        </div>
      )}
      <p className="text-sm font-black text-zinc-muted uppercase tracking-[0.25em]">
        {t('listing.deploy.choose')}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <button
          type="button"
          onClick={() => {
            setDeployChannel('auction');
            setFieldErrors({});
          }}
          className={cn(
            'p-4 md:p-8 rounded-2xl bg-obsidian-card border transition-all text-left',
            deployChannel === 'auction' ? 'border-brand/30' : 'border-white/5 hover:border-brand/20',
          )}
        >
          <Gavel className="w-7 h-7 text-brand mb-4" />
          <h3 className="text-lg font-black text-zinc-text uppercase">{t('listing.deploy.as_auction')}</h3>
          <p className="text-sm text-zinc-muted mt-2">{t('listing.deploy.as_auction_desc')}</p>
        </button>
        <button
          type="button"
          onClick={() => {
            setDeployChannel('group_buy');
            setFieldErrors({});
          }}
          className={cn(
            'p-4 md:p-8 rounded-2xl bg-obsidian-card border transition-all text-left',
            deployChannel === 'group_buy' ? 'border-info/30' : 'border-white/5 hover:border-info/20',
          )}
        >
          <Users className="w-7 h-7 text-info mb-4" />
          <h3 className="text-lg font-black text-zinc-text uppercase">{t('listing.deploy.as_group_buy')}</h3>
          <p className="text-sm text-zinc-muted mt-2">{t('listing.deploy.as_group_buy_desc')}</p>
        </button>
      </div>
    </div>
  );
}
