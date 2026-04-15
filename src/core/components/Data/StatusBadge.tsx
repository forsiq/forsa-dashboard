import React from 'react';
import { cn } from '../../lib/utils/cn';

export type StatusVariant = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'completed' 
  | 'cancelled' 
  | 'failed' 
  | 'warning' 
  | 'info' 
  | 'success' 
  | 'error';

export interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  customColor?: string; // Hex code or valid CSS color for dynamic overrides
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  // Success/Active - Emerald/Green
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  
  // Warning/Pending - Amber/Yellow (Fixed contrast: darker text would be black, but on dark theme we use vibrant on deep)
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]',
  
  // Danger/Error/Cancelled - Rose/Red
  failed: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]',
  error: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]',
  cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  inactive: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  
  // Info/Processing - Cyan/Blue
  info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.05)]',
};

const sizeStyles = {
  sm: 'text-[11px] px-2.5 py-1 h-6',
  md: 'text-xs px-3 py-1.5 h-7',
  lg: 'text-sm px-4 py-2 h-9',
};

const dotSizes = {
  sm: 'w-1 h-1',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'inactive',
  customColor,
  showDot = false,
  size = 'md',
  className
}) => {
  // Check if customColor looks like a CSS value we can use directly
  const isCustomStyle = customColor && (
    customColor.startsWith('#') || 
    customColor.startsWith('rgb') || 
    customColor.startsWith('hsl') ||
    ['red', 'blue', 'green', 'orange', 'purple'].some(c => customColor.includes(c))
  );

  const styleProps = isCustomStyle ? {
    backgroundColor: `color-mix(in srgb, ${customColor}, transparent 90%)`,
    color: customColor,
    borderColor: `color-mix(in srgb, ${customColor}, transparent 80%)`,
  } : {};

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border font-black uppercase tracking-widest whitespace-nowrap select-none transition-all duration-300",
        !isCustomStyle && variantStyles[variant],
        sizeStyles[size],
        className
      )}
      style={styleProps}
    >
      {showDot && (
        <span 
          className={cn(
            "rounded-full bg-current opacity-80", 
            dotSizes[size],
            showDot && "animate-pulse"
          )} 
        />
      )}
      {status}
    </span>
  );
};

