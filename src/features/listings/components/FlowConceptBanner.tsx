import React from 'react';
import { Info } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';

interface FlowConceptBannerProps {
  messageKey: string;
  className?: string;
}

/** One-line explainer for inventory → catalog → publish → live sale flow. */
export function FlowConceptBanner({ messageKey, className }: FlowConceptBannerProps) {
  const { t, dir } = useLanguage();

  return (
    <div
      className={cn(
        'bg-info/5 border border-info/20 p-3 md:p-4 rounded-xl flex items-start gap-3',
        className,
      )}
      dir={dir}
    >
      <Info className="w-4 h-4 text-info shrink-0 mt-0.5" aria-hidden />
      <p className="text-xs md:text-sm text-zinc-muted font-medium leading-relaxed">{t(messageKey)}</p>
    </div>
  );
}
