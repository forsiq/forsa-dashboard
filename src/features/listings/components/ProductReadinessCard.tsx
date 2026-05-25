import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { AlertTriangle, Info, CheckCircle, Edit, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberButton } from '@core/components/AmberButton';
import type { ProductListing } from '../../../types/services/listings.types';
import {
  analyzeProductReadiness,
  getReadinessScore,
  type Shortcoming,
} from '../utils/product-readiness.utils';

interface Props {
  listing: ProductListing;
}

export const ProductReadinessCard: React.FC<Props> = ({ listing }) => {
  const { t, language, dir } = useLanguage();
  const router = useRouter();

  const shortcomings = useMemo(() => analyzeProductReadiness(listing), [listing]);
  const { score, total } = useMemo(() => getReadinessScore(listing), [listing]);

  if (shortcomings.length === 0) {
    return (
      <div
        className="p-5 rounded-2xl bg-success/[0.04] border border-success/10 space-y-3"
        dir={dir}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4 text-success" />
          </div>
          <p className="text-sm font-black text-success uppercase">
            {t('listing.readiness.ready') || 'Ready to Publish'}
          </p>
        </div>
        <p className="text-[11px] text-zinc-muted font-bold tracking-tight">
          {t('listing.readiness.ready_desc') ||
            'All key fields are filled. This product is ready to be published.'}
        </p>
      </div>
    );
  }

  const warningCount = shortcomings.filter((s) => s.severity === 'warning').length;
  const infoCount = shortcomings.filter((s) => s.severity === 'info').length;
  const pct = Math.round((score / total) * 100);

  return (
    <div
      dir={dir}
      className={cn(
        'p-5 rounded-2xl border space-y-4',
        warningCount > 0
          ? 'bg-warning/[0.02] border-warning/10'
          : 'bg-info/[0.02] border-info/10',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
            warningCount > 0
              ? 'bg-warning/10 border border-warning/20'
              : 'bg-info/10 border border-info/20',
          )}
        >
          <ShieldCheck
            className={cn(
              'w-4 h-4',
              warningCount > 0 ? 'text-warning' : 'text-info',
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-black uppercase',
              warningCount > 0 ? 'text-warning' : 'text-info',
            )}
          >
            {t('listing.readiness.title') || 'Product Readiness'}
          </p>
          <p className="text-[11px] text-zinc-muted font-bold tracking-tight">
            {t('listing.readiness.score_label') || 'Score'}:{' '}
            <span className="text-zinc-text">{score}/{total}</span>
            {warningCount > 0 && (
              <span className="text-warning"> ({warningCount} {t('listing.readiness.warnings') || 'critical'})</span>
            )}
            {infoCount > 0 && warningCount === 0 && (
              <span className="text-info"> ({infoCount} {t('listing.readiness.suggestions') || 'suggestions'})</span>
            )}
          </p>
        </div>
        <AmberButton
          variant="secondary"
          className="h-8 text-[11px] font-black rounded-lg px-3 gap-1.5 active:scale-95 transition-all border-border bg-obsidian-card"
          onClick={() => router.push(`/listings/${listing.id}/edit`)}
        >
          <Edit className="w-3 h-3" />
          {t('listing.edit') || 'Edit'}
        </AmberButton>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            pct >= 70
              ? 'bg-success'
              : pct >= 40
                ? 'bg-warning'
                : 'bg-danger',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Shortcoming items */}
      <div className="space-y-2">
        {shortcomings.map((item) => (
          <ShortcomingRow key={item.field} item={item} language={language} />
        ))}
      </div>
    </div>
  );
};

function ShortcomingRow({ item, language }: { item: Shortcoming; language: string }) {
  const isWarning = item.severity === 'warning';
  const message = language === 'ar' ? item.messageAr : item.messageEn;

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 p-2.5 rounded-xl border',
        isWarning
          ? 'bg-warning/[0.03] border-warning/10'
          : 'bg-info/[0.03] border-info/10',
      )}
    >
      {isWarning ? (
        <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
      ) : (
        <Info className="w-3.5 h-3.5 text-info shrink-0 mt-0.5" />
      )}
      <p className="text-[11px] text-zinc-text font-bold leading-snug">{message}</p>
    </div>
  );
}
