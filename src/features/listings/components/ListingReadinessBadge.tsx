import React, { useMemo, useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import type { ProductListing } from '../../../types/services/listings.types';
import { analyzeProductReadiness } from '../utils/product-readiness.utils';

interface Props {
  listing: ProductListing;
}

export const ListingReadinessBadge: React.FC<Props> = ({ listing }) => {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);

  const shortcomings = useMemo(() => analyzeProductReadiness(listing), [listing]);

  if (shortcomings.length === 0) return null;

  const hasWarning = shortcomings.some((s) => s.severity === 'warning');

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          'relative flex items-center justify-center w-7 h-7 rounded-lg border transition-all',
          hasWarning
            ? 'bg-warning/10 border-warning/20 text-warning hover:bg-warning/20'
            : 'bg-info/10 border-info/20 text-info hover:bg-info/20',
        )}
        aria-label={t('listing.readiness.issues_tooltip') || 'Product issues'}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        {hasWarning ? (
          <AlertTriangle className="w-3.5 h-3.5" />
        ) : (
          <Info className="w-3.5 h-3.5" />
        )}
        <span
          className={cn(
            'absolute -top-1 -end-1 min-w-[14px] h-[14px] px-0.5 rounded-full text-[9px] font-black flex items-center justify-center',
            hasWarning ? 'bg-warning text-black' : 'bg-info text-white',
          )}
        >
          {shortcomings.length}
        </span>
      </button>

      {open && (
        <div
          className="absolute z-50 top-full mt-1.5 start-0 w-64 p-3 rounded-xl border border-border bg-obsidian-card shadow-xl space-y-2"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
            {t('listing.readiness.issues_tooltip') || 'Product issues'}
          </p>
          {shortcomings.map((item) => {
            const message = language === 'ar' ? item.messageAr : item.messageEn;
            const isWarning = item.severity === 'warning';
            return (
              <div
                key={item.field}
                className={cn(
                  'flex items-start gap-2 p-2 rounded-lg border',
                  isWarning
                    ? 'bg-warning/[0.03] border-warning/10'
                    : 'bg-info/[0.03] border-info/10',
                )}
              >
                {isWarning ? (
                  <AlertTriangle className="w-3 h-3 text-warning shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-3 h-3 text-info shrink-0 mt-0.5" />
                )}
                <p className="text-[10px] text-zinc-text font-bold leading-snug">{message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ListingReadinessBadge;
