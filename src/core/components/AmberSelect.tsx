import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils/cn';
import { useLanguage } from '../contexts/LanguageContext';

export interface AmberSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  /**
   * default: h-14 (align with AmberInput)
   * sm: h-11 — filters / toolbars
   * xs: h-10 — dense grids
   * Named fieldSize because native select `size` is a number attribute.
   */
  fieldSize?: 'default' | 'sm' | 'xs';
  /** If false, only border reflects error; no duplicate message (e.g. FormField provides text). */
  showErrorText?: boolean;
}

export const AmberSelect = React.forwardRef<HTMLSelectElement, AmberSelectProps>(
  (
    {
      label,
      error,
      className,
      fieldSize = 'default',
      showErrorText = true,
      disabled,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const { isRTL, dir } = useLanguage();
    const selectId = id ?? React.useId();

    const sizeClasses =
      fieldSize === 'default'
        ? 'h-14 text-base min-h-[3.5rem]'
        : fieldSize === 'sm'
          ? 'h-11 text-sm min-h-[2.75rem]'
          : 'h-10 text-sm min-h-[2.5rem]';

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'flex justify-between px-1 text-xs font-bold uppercase tracking-[0.15em] transition-colors',
              error ? 'text-danger' : 'text-zinc-muted/90 dark:text-zinc-muted/80'
            )}
          >
            <span>
              {label} {props.required && <span className="ml-0.5 text-brand">*</span>}
            </span>
            {error && showErrorText && label && (
              <span className="text-[10px] normal-case opacity-90">{error}</span>
            )}
          </label>
        )}
        <div className="group relative w-full">
          <select
            id={selectId}
            ref={ref}
            dir={dir}
            disabled={disabled}
            aria-invalid={!!error}
            className={cn(
              'w-full cursor-pointer appearance-none font-medium text-zinc-text outline-none transition-all',
              'bg-white shadow-sm dark:bg-obsidian-card',
              'border border-zinc-200 dark:border-white/5',
              'rounded-xl',
              'focus:border-brand/40 focus:ring-0 dark:focus:bg-obsidian-hover',
              'disabled:cursor-not-allowed disabled:opacity-50',
              isRTL ? 'pl-10 pr-4' : 'pr-10 pl-4',
              sizeClasses,
              error
                ? 'border-danger bg-danger/[0.03] focus:border-danger'
                : '',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className={cn(
              'pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-muted',
              'group-focus-within:text-brand',
              isRTL ? 'left-3' : 'right-3'
            )}
            aria-hidden
          />
        </div>
        {error && !label && showErrorText && (
          <p className="px-1 text-xs font-medium text-danger">{error}</p>
        )}
      </div>
    );
  }
);

AmberSelect.displayName = 'AmberSelect';
