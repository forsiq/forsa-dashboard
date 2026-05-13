import React, { useState, useRef, useEffect } from 'react';
import { CircleHelp } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';

export interface FieldHelpHintProps {
  /** Explanation shown when the user opens the hint */
  text: string;
  className?: string;
}

/**
 * Small help icon; click toggles a short explanation (for numeric / non-obvious fields).
 */
export function FieldHelpHint({ text, className }: FieldHelpHintProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { dir, t } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className={cn('relative inline-flex shrink-0 items-center', className)} dir={dir}>
      <button
        type="button"
        aria-label={t('common.field_help')}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="rounded p-0.5 text-zinc-muted transition-colors hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        <CircleHelp className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
      </button>
      {open ? (
        <div
          role="tooltip"
          className={cn(
            'absolute top-full z-[80] mt-1.5 w-64 max-w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-white/10 bg-obsidian-card p-3 text-xs font-medium leading-relaxed text-zinc-text shadow-xl',
            dir === 'rtl' ? 'end-0 start-auto' : 'start-0 end-auto',
          )}
        >
          {text}
        </div>
      ) : null}
    </div>
  );
}
