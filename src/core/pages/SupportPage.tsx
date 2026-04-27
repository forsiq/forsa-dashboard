import React from 'react';
import Link from 'next/link';
import { ArrowRight, Headphones, LifeBuoy, MessageCircle } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { PageHeader } from '@core/components/Layout/PageHeader';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';

export const SupportPage: React.FC = () => {
  const { t, dir } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <PageHeader title={t('support.page_title')} description={t('support.intro')} />

      <AmberCard glass className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-muted">
          <Headphones className="h-4 w-4 text-brand" />
          {t('support.resources_title')}
        </div>
        <Link
          href="/help"
          className={cn(
            'flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-zinc-text transition-colors hover:border-brand/30 hover:bg-brand/5',
            dir === 'rtl' && 'flex-row-reverse'
          )}
        >
          <span>{t('support.link_help')}</span>
          <ArrowRight
            className={cn('h-4 w-4 shrink-0 text-brand', dir === 'rtl' && 'rotate-180')}
          />
        </Link>
      </AmberCard>

      <AmberCard className="border border-white/10 bg-white/[0.02]">
        <div className="flex items-start gap-3">
          <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-info" />
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-tight text-white">
              {t('support.channels_title')}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-muted">{t('support.channels_body')}</p>
          </div>
        </div>
      </AmberCard>

      <AmberCard className="border border-white/10 bg-white/[0.02]">
        <div className="flex items-start gap-3">
          <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-tight text-white">
              {t('support.tips_title')}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-muted">{t('support.tips_body')}</p>
          </div>
        </div>
      </AmberCard>
    </div>
  );
};
