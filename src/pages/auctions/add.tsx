import { useRouter } from 'next/router';
import { Gavel, List, Plus, ArrowRight } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberButton } from '@core/components/AmberButton';
import { AmberCard } from '@core/components/AmberCard';
import { cn } from '@core/lib/utils/cn';

export default function AuctionAddPage() {
  const router = useRouter();
  const { t, dir } = useLanguage();

  return (
    <div
      className="max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
      dir={dir}
    >
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-brand/10 rounded-2xl flex items-center justify-center border border-brand/20">
            <Gavel className="w-10 h-10 text-brand" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-zinc-text tracking-tight uppercase">
          {t('auction.create.title') || 'Create an Auction'}
        </h1>
        <p className="text-sm font-medium text-zinc-muted max-w-[400px] mx-auto leading-relaxed">
          {t('auction.create.flow_desc') || 'To create an auction, first create a listing with all the product details. Then deploy it as a live auction from the listing management page.'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Step 1 */}
        <AmberCard className="p-6 bg-obsidian-card border-border shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-brand">1</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('auction.create.step1_title') || 'Create a Listing'}
              </h3>
              <p className="text-[13px] text-zinc-muted mt-1">
                {t('auction.create.step1_desc') || 'Add product details, images, pricing, and specifications.'}
              </p>
            </div>
            <AmberButton
              className="shrink-0 h-10 bg-brand text-black font-bold uppercase tracking-wider rounded-xl px-6 hover:bg-brand/90 active:scale-95 transition-all border-none text-xs gap-1.5"
              onClick={() => void router.push('/listings/new')}
            >
              <Plus className="w-3.5 h-3.5" />
              {t('auction.create.new_listing') || 'New Listing'}
            </AmberButton>
          </div>
        </AmberCard>

        {/* Step 2 */}
        <AmberCard className="p-6 bg-obsidian-card border-border shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-warning">2</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">
                {t('auction.create.step2_title') || 'Deploy as Auction'}
              </h3>
              <p className="text-[13px] text-zinc-muted mt-1">
                {t('auction.create.step2_desc') || 'From your listing, configure auction timing and deploy it live.'}
              </p>
            </div>
            <AmberButton
              variant="secondary"
              className="shrink-0 h-10 font-bold uppercase tracking-wider rounded-xl px-6 active:scale-95 transition-all text-xs gap-1.5"
              onClick={() => void router.push('/listings')}
            >
              <List className="w-3.5 h-3.5" />
              {t('auction.create.view_listings') || 'My Listings'}
            </AmberButton>
          </div>
        </AmberCard>
      </div>

      <div className="pt-4 text-center">
        <AmberButton
          variant="outline"
          className="font-bold uppercase tracking-wider text-xs gap-2 h-10"
          onClick={() => void router.push('/auctions')}
        >
          {t('common.back') || 'Back to Auctions'}
        </AmberButton>
      </div>
    </div>
  );
}
