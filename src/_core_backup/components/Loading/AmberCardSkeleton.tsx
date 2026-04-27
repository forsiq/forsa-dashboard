import React from 'react';
import { cn } from '../../lib/utils/cn';
import { AmberSkeleton } from '../AmberSkeleton';

// --- Types ---

export interface AmberCardSkeletonProps {
  avatar?: boolean;
  header?: boolean;
  lines?: number;
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

// --- Card Skeleton Component ---

/**
 * AmberCardSkeleton - Card loading placeholder
 *
 * @example
 * // Vertical layout with avatar
 * <AmberCardSkeleton avatar header lines={4} />
 *
 * @example
 * // Horizontal layout
 * <AmberCardSkeleton layout="horizontal" />
 */
export const AmberCardSkeleton = React.forwardRef<HTMLDivElement, AmberCardSkeletonProps>(
  (
    {
      avatar = false,
      header = true,
      lines = 3,
      layout = 'vertical',
      className,
    },
    ref
  ) => {
    const isHorizontal = layout === 'horizontal';

    return (
      <div
        ref={ref}
        className={cn(
          'p-6 border border-white/5 rounded-lg bg-obsidian-card',
          isHorizontal ? 'flex gap-6' : 'space-y-4',
          className
        )}
      >
        {/* Avatar Section */}
        {avatar && (
          <div className={cn(isHorizontal ? 'flex-shrink-0' : '')}>
            <AmberSkeleton variant="circular" width={48} height={48} />
          </div>
        )}

        {/* Content Section */}
        <div className={cn('flex-1 space-y-3', isHorizontal ? 'space-y-2' : 'space-y-3')}>
          {/* Header */}
          {header && (
            <div className="space-y-2">
              <AmberSkeleton variant="text" className="h-6 w-1/3" />
              <AmberSkeleton variant="text" className="h-4 w-1/4" />
            </div>
          )}

          {/* Body Lines */}
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
              <AmberSkeleton
                key={i}
                variant="text"
                className={cn(
                  i === lines - 1 && 'w-3/4',
                  i === lines - 2 && 'w-5/6'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

AmberCardSkeleton.displayName = 'AmberCardSkeleton';

// --- Grid Skeleton ---

export interface CardGridSkeletonProps {
  count?: number;
  avatar?: boolean;
  header?: boolean;
  lines?: number;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * CardGridSkeleton - Multiple card placeholders in a grid
 *
 * @example
 * <CardGridSkeleton count={6} columns={3} />
 */
export const CardGridSkeleton = React.forwardRef<HTMLDivElement, CardGridSkeletonProps>(
  ({ count = 6, avatar = false, header = true, lines = 3, columns = 3, className }, ref) => {
    const gridCols: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    return (
      <div ref={ref} className={cn('grid gap-4', gridCols[columns], className)}>
        {Array.from({ length: count }).map((_, i) => (
          <AmberCardSkeleton
            key={i}
            avatar={avatar}
            header={header}
            lines={lines}
          />
        ))}
      </div>
    );
  }
);

CardGridSkeleton.displayName = 'CardGridSkeleton';

// --- Stat Card Skeleton ---

export interface StatCardSkeletonProps {
  icon?: boolean;
  className?: string;
}

/**
 * StatCardSkeleton - Statistics card placeholder
 *
 * @example
 * <StatCardSkeleton icon />
 */
export const StatCardSkeleton = React.forwardRef<HTMLDivElement, StatCardSkeletonProps>(
  ({ icon = true, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'p-6 border border-white/5 rounded-lg bg-obsidian-card',
          'flex items-center justify-between',
          className
        )}
      >
        <div className="space-y-2">
          <AmberSkeleton variant="text" className="h-4 w-24" />
          <AmberSkeleton variant="text" className="h-8 w-16" />
        </div>
        {icon && <AmberSkeleton variant="circular" width={40} height={40} />}
      </div>
    );
  }
);

StatCardSkeleton.displayName = 'StatCardSkeleton';

// --- Stats Row Skeleton ---

export interface StatsRowSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * StatsRowSkeleton - Multiple stat cards in a row
 *
 * @example
 * <StatsRowSkeleton count={4} />
 */
export const StatsRowSkeleton = React.forwardRef<HTMLDivElement, StatsRowSkeletonProps>(
  ({ count = 3, className }, ref) => {
    return (
      <div ref={ref} className={cn('grid gap-4 md:grid-cols-3', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }
);

StatsRowSkeleton.displayName = 'StatsRowSkeleton';

// --- List Item Skeleton ---

export interface ListItemSkeletonProps {
  avatar?: boolean;
  subtitle?: boolean;
  action?: boolean;
  className?: string;
}

/**
 * ListItemSkeleton - List item placeholder
 *
 * @example
 * <ListItemSkeleton avatar subtitle action />
 */
export const ListItemSkeleton = React.forwardRef<HTMLDivElement, ListItemSkeletonProps>(
  ({ avatar = false, subtitle = true, action = true, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-4 px-6 py-4 border-b border-white/[0.02]',
          className
        )}
      >
        {avatar && <AmberSkeleton variant="circular" width={40} height={40} />}
        <div className="flex-1 space-y-2">
          <AmberSkeleton variant="text" className="h-4 w-1/3" />
          {subtitle && <AmberSkeleton variant="text" className="h-3 w-1/2" />}
        </div>
        {action && <AmberSkeleton variant="rectangular" width={32} height={32} />}
      </div>
    );
  }
);

ListItemSkeleton.displayName = 'ListItemSkeleton';

// --- List Skeleton ---

export interface ListSkeletonProps {
  count?: number;
  avatar?: boolean;
  subtitle?: boolean;
  action?: boolean;
  className?: string;
}

/**
 * ListSkeleton - Multiple list item placeholders
 *
 * @example
 * <ListSkeleton count={5} avatar subtitle />
 */
export const ListSkeleton = React.forwardRef<HTMLDivElement, ListSkeletonProps>(
  ({ count = 5, avatar = false, subtitle = true, action = true, className }, ref) => {
    return (
      <div ref={ref} className={cn('divide-y divide-white/[0.02]', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <ListItemSkeleton
            key={i}
            avatar={avatar}
            subtitle={subtitle}
            action={action}
          />
        ))}
      </div>
    );
  }
);

ListSkeleton.displayName = 'ListSkeleton';

export default AmberCardSkeleton;
