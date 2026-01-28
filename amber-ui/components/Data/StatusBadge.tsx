
import React from 'react';
import { cn } from '../../../lib/cn';

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
  active: 'bg-success/10 text-success border-success/20',
  success: 'bg-success/10 text-success border-success/20',
  completed: 'bg-success/10 text-success border-success/20',
  
  pending: 'bg-warning/10 text-warning border-warning/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  
  failed: 'bg-danger/10 text-danger border-danger/20',
  error: 'bg-danger/10 text-danger border-danger/20',
  cancelled: 'bg-danger/10 text-danger border-danger/20',
  
  info: 'bg-info/10 text-info border-info/20',
  
  inactive: 'bg-white/5 text-zinc-muted border-white/10',
};

const sizeStyles = {
  sm: 'text-[9px] px-1.5 py-0.5 h-5',
  md: 'text-[10px] px-2 py-0.5 h-6',
  lg: 'text-xs px-2.5 py-1 h-7',
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
        "inline-flex items-center gap-1.5 rounded-sm border font-black uppercase tracking-widest whitespace-nowrap select-none",
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
            showDot && "animate-pulse" // Optional subtle pulse for liveness
          )} 
        />
      )}
      {status}
    </span>
  );
};
