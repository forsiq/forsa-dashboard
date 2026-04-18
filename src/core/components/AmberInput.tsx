
import React from 'react';
import { cn } from '../lib/utils/cn';
import { useLanguage } from '../contexts/LanguageContext';

interface AmberInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  multiline?: boolean;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  rows?: number;
  /** Controls border radius. 'rounded' = rounded-xl (default), 'square' = rounded-sm */
  shape?: 'rounded' | 'square';
}

export const AmberInput = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, AmberInputProps>(({ 
  label, 
  error, 
  className, 
  multiline, 
  icon,
  rightElement,
  shape = 'rounded',
  ...props 
}, ref) => {
  const { isRTL } = useLanguage();
  const InputComponent = multiline ? 'textarea' : 'input';
  const radiusClass = shape === 'square' ? 'rounded-sm' : 'rounded-xl';
  
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className={cn(
          "text-xs font-bold uppercase tracking-[0.15em] px-1 flex justify-between transition-colors",
          error ? "text-danger" : "text-zinc-muted/90 dark:text-zinc-muted/80"
        )}>
          <span>{label} {props.required && <span className="text-brand ml-0.5">*</span>}</span>
          {error && <span className="normal-case opacity-90 text-[10px]">{error}</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 transition-colors pointer-events-none z-10",
            isRTL ? "right-4" : "left-4",
            multiline ? "top-5 translate-y-0" : "",
            error ? "text-danger" : "text-zinc-muted dark:text-zinc-muted group-focus-within:text-brand"
          )}>
            {icon}
          </div>
        )}
        <InputComponent
          ref={ref as any}
          className={cn(
            "w-full bg-white dark:bg-obsidian-card border text-base font-medium text-zinc-text outline-none transition-all placeholder:text-zinc-muted/40 shadow-sm",
            radiusClass,
            multiline ? "p-4 resize-none" : "h-14 px-4",
            icon && !multiline ? (isRTL ? "pr-11" : "pl-11") : "",
            icon && multiline ? (isRTL ? "pr-11" : "pl-11") : "",
            rightElement && !multiline ? (isRTL ? "pl-11" : "pr-11") : "",
            error 
              ? "border-danger focus:border-danger bg-danger/[0.03]" 
              : "border-zinc-200 dark:border-white/5 focus:border-brand/40 dark:focus:bg-obsidian-hover",
            className
          )}
          {...props as any}
        />
        {rightElement && (
            <div className={cn(
                "absolute top-1/2 -translate-y-1/2 text-zinc-muted/60 transition-colors hover:text-zinc-text z-10",
                isRTL ? "left-4" : "right-4"
            )}>
                {rightElement}
            </div>
        )}
      </div>
    </div>
  );
});

AmberInput.displayName = 'AmberInput';

