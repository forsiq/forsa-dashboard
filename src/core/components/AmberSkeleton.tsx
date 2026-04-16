import React from 'react';
import { cn } from '../lib/utils/cn';

// --- Types ---

export interface AmberSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

// --- Base Skeleton Component ---

/**
 * AmberSkeleton - Loading placeholder component
 *
 * @example
 * // Text skeleton (default)
 * <AmberSkeleton />
 *
 * @example
 * // Circular avatar skeleton
 * <AmberSkeleton variant="circular" width={40} height={40} />
 *
 * @example
 * // Multiple lines
 * <AmberSkeleton count={3} />
 */
export const AmberSkeleton = React.forwardRef<HTMLDivElement, AmberSkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      count = 1,
      animation = 'pulse',
      className,
      style,
      ...props
    },
    ref
  ) => {
    const skeletonStyle: React.CSSProperties = {
      ...style,
      ...(width !== undefined && { width: typeof width === 'number' ? `${width}px` : width }),
      ...(height !== undefined && { height: typeof height === 'number' ? `${height}px` : height }),
    };

    const variantStyles: Record<string, string> = {
      text: 'rounded-sm h-4 w-full',
      circular: 'rounded-full',
      rectangular: 'rounded-sm',
    };

    const animationStyles: Record<string, string> = {
      pulse: 'animate-pulse',
      wave: 'animate-shimmer',
      none: '',
    };

    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            ref={index === 0 ? ref : null}
            className={cn(
              'bg-zinc-card/50',
              variantStyles[variant],
              animationStyles[animation],
              className
            )}
            style={skeletonStyle}
            {...props}
          />
        ))}
      </>
    );
  }
);

AmberSkeleton.displayName = 'AmberSkeleton';

// --- Specialized Variants ---

export interface AmberTextSkeletonProps extends Omit<AmberSkeletonProps, 'variant'> {
  lines?: number;
}

/**
 * AmberTextSkeleton - Text placeholder with multiple lines support
 */
export const AmberTextSkeleton = React.forwardRef<HTMLDivElement, AmberTextSkeletonProps>(
  ({ lines = 3, className, ...props }, ref) => {
    return (
      <div className={cn('space-y-2', className)} ref={ref} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <AmberSkeleton
            key={index}
            variant="text"
            className={cn(index === lines - 1 && 'w-3/4')}
          />
        ))}
      </div>
    );
  }
);

AmberTextSkeleton.displayName = 'AmberTextSkeleton';

/**
 * AmberAvatarSkeleton - Avatar placeholder
 */
export const AmberAvatarSkeleton = React.forwardRef<
  HTMLDivElement,
  { size?: number } & Omit<AmberSkeletonProps, 'variant'>
>(({ size = 40, className, ...props }, ref) => {
  return (
    <AmberSkeleton
      ref={ref}
      variant="circular"
      width={size}
      height={size}
      className={cn('flex-shrink-0', className)}
      {...props}
    />
  );
});

AmberAvatarSkeleton.displayName = 'AmberAvatarSkeleton';

/**
 * AmberCardSkeleton - Card content placeholder
 */
export const AmberCardSkeleton = React.forwardRef<
  HTMLDivElement,
  { header?: boolean; avatar?: boolean; lines?: number } & AmberSkeletonProps
>(({ header = true, avatar = false, lines = 3, className, ...props }, ref) => {
  return (
    <div className={cn('p-4 space-y-4', className)} ref={ref} {...props}>
      {header && (
        <div className="flex items-center gap-3">
          {avatar && <AmberAvatarSkeleton size={40} />}
          <div className="space-y-2 flex-1">
            <AmberSkeleton variant="text" className="h-5 w-1/3" />
            <AmberSkeleton variant="text" className="h-4 w-1/4" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <AmberTextSkeleton lines={lines} />
      </div>
    </div>
  );
});

AmberCardSkeleton.displayName = 'AmberCardSkeleton';

export default AmberSkeleton;
