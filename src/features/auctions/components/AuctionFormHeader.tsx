import React from 'react';
import { useRouter } from 'next/router';
import { Save, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';

interface AuctionFormHeaderProps {
  mode: 'create' | 'edit' | 'clone';
  id?: string | string[] | undefined;
  isSubmitting: boolean;
  isUploading: boolean;
  onSubmit: (e?: React.FormEvent) => void;
}

export const AuctionFormHeader: React.FC<AuctionFormHeaderProps> = ({
  mode,
  id,
  isSubmitting,
  isUploading,
  onSubmit,
}) => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const isRTL = dir === 'rtl';

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <AmberButton variant="secondary" className="p-0 w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-all bg-obsidian-card border-border" onClick={() => router.push('/auctions')}>
          <ChevronLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
        </AmberButton>
        <div>
          <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase leading-none">
            {mode === 'clone' ? (t('auction.form.header.clone') || 'Clone Auction') : mode === 'edit' ? t('auction.form.header.edit') : t('auction.form.header.create')}
          </h1>
          <p className="text-sm text-zinc-muted font-bold tracking-tight uppercase mt-1">
            {mode === 'clone' ? (t('auction.form.subtitle.clone') || `Duplicating auction #${id}`).replace('{id}', String(id)) : mode === 'edit' ? t('auction.form.subtitle.edit', { id: String(id) }) : t('auction.form.subtitle.create')}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <AmberButton
          variant="outline"
          className="h-11 border-border font-bold rounded-xl px-6 hover:bg-obsidian-hover active:scale-95 transition-all"
          onClick={() => router.push('/auctions')}
        >
          {t('auction.form.action.abort')}
        </AmberButton>
        <AmberButton
          className="h-11 bg-brand hover:bg-brand text-black font-black rounded-xl px-10 shadow-lg border-none active:scale-95 transition-all gap-2"
          onClick={onSubmit}
          disabled={isSubmitting || isUploading}
        >
          {(isSubmitting || isUploading) ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{mode === 'clone' ? (t('auction.form.action.clone') || 'Clone Auction') : mode === 'edit' ? t('auction.form.action.sync') : t('auction.form.action.deploy')}</span>
        </AmberButton>
      </div>
    </div>
  );
};
