import React from 'react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';

export type AmberDateTimeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange'
> & {
  label?: string;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Extra classes on the native input (height, tabular-nums, etc.) */
  inputClassName?: string;
  icon?: React.ReactNode;
};

/**
 * Native datetime-local with the same chrome as FormField DateField (obsidian tokens, py-3).
 * Wrapper class `amber-datetime-local` scopes dark-mode / WebKit picker fixes in core-ui-theme.css.
 */
export const AmberDateTimeInput = React.forwardRef<HTMLInputElement, AmberDateTimeInputProps>(
  ({ label, error, className, inputClassName, icon, required, disabled, ...rest }, ref) => {
    const { dir, isRTL } = useLanguage();
    return (
      <div
        className={cn('amber-datetime-local space-y-1.5 w-full', className)}
        dir={dir}
        data-has-leading-icon={icon ? 'true' : undefined}
      >
        {label && (
          <label
            className={cn(
              'text-xs font-bold uppercase tracking-[0.15em] px-1 flex justify-between transition-colors',
              error ? 'text-danger' : 'text-zinc-muted/90 dark:text-zinc-muted/80'
            )}
          >
            <span>
              {label}
              {required ? <span className="text-brand ml-0.5">*</span> : null}
            </span>
            {error ? <span className="normal-case opacity-90 text-[10px]">{error}</span> : null}
          </label>
        )}
        <div className="relative group">
          {icon ? (
            <div
              className={cn(
                'absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none transition-colors',
                isRTL ? 'right-4' : 'left-4',
                error ? 'text-danger' : 'text-zinc-muted dark:text-zinc-muted group-focus-within:text-brand'
              )}
            >
              {icon}
            </div>
          ) : null}
          <input
            ref={ref}
            type="datetime-local"
            disabled={disabled}
            required={required}
            dir="ltr"
            className={cn(
              'amber-datetime-input-target w-full h-14 rounded-xl border text-base font-medium text-zinc-text outline-none transition-all shadow-sm tabular-nums',
              'bg-white dark:bg-obsidian-card',
              'focus:outline-none focus:border-brand/40 dark:focus:bg-obsidian-hover',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'placeholder:text-zinc-muted/40',
              error
                ? 'border-danger focus:border-danger bg-danger/[0.03]'
                : 'border-zinc-200 dark:border-white/5',
              /* pe-11: native calendar affordance; start padding matches AmberInput with/without leading icon */
              icon
                ? isRTL
                  ? 'pl-4 pr-11'
                  : 'pl-11 pr-11'
                : 'px-4 pr-11',
              inputClassName
            )}
            {...rest}
          />
        </div>
        {error && !label ? (
          <p className="text-xs text-danger font-medium">{error}</p>
        ) : null}
      </div>
    );
  }
);

AmberDateTimeInput.displayName = 'AmberDateTimeInput';
