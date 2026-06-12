import React from 'react';
import { AmberCard } from '@core/components/AmberCard';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';

export interface ReportPanelCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** When true, shows empty label instead of chart/table body */
  isEmpty?: boolean;
  emptyMessage?: string;
  bodyMinHeight?: string;
}

/**
 * Report section card with visible title (Dashboard pattern).
 * Avoids invalid `title` HTML attribute on AmberCard.
 */
export function ReportPanelCard({
  title,
  children,
  className,
  contentClassName,
  isEmpty = false,
  emptyMessage,
  bodyMinHeight = 'min-h-[280px]',
}: ReportPanelCardProps) {
  const { t } = useLanguage();

  return (
    <AmberCard className={cn('!p-5 md:!p-6 flex flex-col border border-border min-w-0 h-full', className)}>
      <div className="mb-4 md:mb-6 border-b border-white/5 pb-3 md:pb-4">
        <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.15em] border-s-2 border-brand ps-3 leading-snug break-words">
          {title}
        </h3>
      </div>
      {isEmpty ? (
        <div
          className={cn(
            'w-full flex flex-1 flex-col items-center justify-center px-4 py-10',
            bodyMinHeight,
            contentClassName
          )}
        >
          <p className="text-sm text-zinc-muted font-semibold text-center leading-relaxed max-w-sm">
            {emptyMessage ?? t('report.no_data')}
          </p>
        </div>
      ) : (
        <div className={cn('w-full min-w-0', contentClassName)}>{children}</div>
      )}
    </AmberCard>
  );
}
