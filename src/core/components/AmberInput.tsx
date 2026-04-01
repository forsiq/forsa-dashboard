
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

export const AmberInput: React.FC<AmberInputProps> = ({ 
  label, 
  error, 
  className, 
  multiline, 
  icon,
  rightElement,
  shape = 'rounded',
  ...props 
}) => {
  const { isRTL } = useLanguage();
  const InputComponent = multiline ? 'textarea' : 'input';
  const radiusClass = shape === 'square' ? 'rounded-sm' : 'rounded-xl';
  
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className={cn(
          "text-[9px] font-black uppercase tracking-widest px-1 flex justify-between",
          error ? "text-danger" : "text-zinc-muted"
        )}>
          <span>{label} {props.required && <span className="text-brand">*</span>}</span>
          {error && <span className="italic normal-case opacity-90">{error}</span>}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 transition-colors pointer-events-none",
            isRTL ? "right-3" : "left-3",
            multiline ? "top-4 translate-y-0" : "",
            error ? "text-danger" : "text-zinc-muted group-focus-within:text-brand"
          )}>
            {icon}
          </div>
        )}
        <InputComponent
          className={cn(
            "w-full bg-obsidian-outer border text-sm font-bold text-zinc-text outline-none transition-all placeholder:text-zinc-muted/40",
            radiusClass,
            multiline ? "p-4 resize-none" : "h-11 px-4",
            icon && !multiline ? (isRTL ? "pr-10" : "pl-10") : "",
            icon && multiline ? (isRTL ? "pr-10" : "pl-10") : "",
            rightElement && !multiline ? (isRTL ? "pl-10" : "pr-10") : "",
            error 
              ? "border-danger/50 focus:border-danger bg-danger/[0.02]" 
              : "border-white/5 focus:border-brand/30 focus:bg-obsidian-outer/80",
            className
          )}
          {...props as any}
        />
        {rightElement && (
            <div className={cn(
                "absolute top-1/2 -translate-y-1/2 text-zinc-muted",
                isRTL ? "left-3" : "right-3"
            )}>
                {rightElement}
            </div>
        )}
      </div>
    </div>
  );
};

