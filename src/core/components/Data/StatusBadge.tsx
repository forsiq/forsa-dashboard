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
  active: 'bg-[#E7FBF3] text-[#059669] border-[#D1FAE5]',
  success: 'bg-[#E7FBF3] text-[#059669] border-[#D1FAE5]',
  completed: 'bg-[#E7FBF3] text-[#059669] border-[#D1FAE5]',
  
  pending: 'bg-[#FFF9E6] text-[#FFC000] border-[#FEF3C7]',
  warning: 'bg-[#FFF9E6] text-[#FFC000] border-[#FEF3C7]',
  
  failed: 'bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6]',
  error: 'bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6]',
  cancelled: 'bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6]',
  inactive: 'bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6]', // Matching image "غير نشط"
  
  info: 'bg-blue-50 text-blue-700 border-blue-100',
};

const sizeStyles = {
  sm: 'text-[10px] px-2 py-0.5 h-5',
  md: 'text-[11px] px-2.5 py-0.5 h-6',
  lg: 'text-xs px-3 py-1 h-7',
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
        "inline-flex items-center gap-1.5 rounded-sm border font-bold whitespace-nowrap select-none",
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

