import React from 'react';
import Link from 'next/link';
import { ArrowRight, CreditCard, FileText, Receipt } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { PageHeader } from '@core/components/Layout/PageHeader';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';

export const BillingPage: React.FC = () => {
  const { t, dir } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <PageHeader title={t('billing_portal.page_title')} description={t('billing_portal.intro')} />

      <AmberCard glass className="space-y-3">
        <div className="flex items-start gap-3">
          <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-tight text-white">
              {t('billing_portal.plan_title')}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-muted">{t('billing_portal.plan_body')}</p>
          </div>
        </div>
      </AmberCard>

      <AmberCard className="border border-white/10 bg-white/[0.02]">
        <div className="flex items-start gap-3">
          <Receipt className="mt-0.5 h-5 w-5 shrink-0 text-info" />
          <div className="space-y-2">
            <h2 className="text-sm font-black uppercase tracking-tight text-white">
              {t('billing_portal.invoices_title')}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-muted">
              {t('billing_portal.invoices_body')}
            </p>
          </div>
        </div>
      </AmberCard>

      <AmberCard className="border border-white/10 bg-white/[0.02]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="space-y-1">
              <h2 className="text-sm font-black uppercase tracking-tight text-white">
                {t('billing_portal.support_title')}
              </h2>
            </div>
          </div>
          <Link
            href="/support"
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-zinc-text transition-colors hover:border-brand/30 hover:bg-brand/5',
              dir === 'rtl' && 'flex-row-reverse'
            )}
          >
            {t('billing_portal.support_link')}
            <ArrowRight
              className={cn('h-4 w-4 shrink-0 text-brand', dir === 'rtl' && 'rotate-180')}
            />
          </Link>
        </div>
      </AmberCard>
    </div>
  );
};
