import React from 'react';
import { cn } from '../../lib/utils/cn';

// --- Types ---

export interface AmberTableSkeletonProps {
  rows?: number;
  columns?: number;
  hasHeader?: boolean;
  hasActions?: boolean;
  hasSelection?: boolean;
  className?: string;
}

// --- Table Skeleton Component ---

/**
 * AmberTableSkeleton - Table loading placeholder
 *
 * @example
 * <AmberTableSkeleton rows={5} columns={4} />
 *
 * @example
 * // With actions and selection
 * <AmberTableSkeleton rows={10} columns={6} hasActions hasSelection />
 */
export const AmberTableSkeleton = React.forwardRef<HTMLDivElement, AmberTableSkeletonProps>(
  (
    {
      rows = 5,
      columns = 4,
      hasHeader = true,
      hasActions = true,
      hasSelection = false,
      className,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('w-full space-y-3', className)}>
        {/* Table Header Skeleton */}
        {hasHeader && (
          <div className="flex items-center gap-4 px-6 py-4 border-b border-white/5 bg-obsidian-outer/30">
            {hasSelection && (
              <div className="w-4 h-4 bg-zinc-card/50 rounded animate-pulse flex-shrink-0" />
            )}
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={`header-${i}`}
                className="h-4 bg-zinc-card/50 rounded animate-pulse flex-shrink-0"
                style={{ width: i === 0 ? '120px' : '80px' }}
              />
            ))}
            {hasActions && (
              <div className="w-16 h-4 bg-zinc-card/50 rounded animate-pulse ml-auto flex-shrink-0" />
            )}
          </div>
        )}

        {/* Table Body Skeleton */}
        <div className="space-y-1">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRowSkeleton
              key={`row-${rowIndex}`}
              columns={columns}
              hasActions={hasActions}
              hasSelection={hasSelection}
            />
          ))}
        </div>
      </div>
    );
  }
);

AmberTableSkeleton.displayName = 'AmberTableSkeleton';

// --- Single Row Skeleton ---

export interface TableRowSkeletonProps {
  columns?: number;
  hasActions?: boolean;
  hasSelection?: boolean;
  className?: string;
}

/**
 * TableRowSkeleton - Single table row placeholder
 * Use this inside existing tables for inline loading
 */
export const TableRowSkeleton = React.forwardRef<HTMLDivElement, TableRowSkeletonProps>(
  ({ columns = 4, hasActions = true, hasSelection = false, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-4 px-6 py-4 border-b border-white/[0.02]', className)}
      >
        {/* Selection Checkbox */}
        {hasSelection && (
          <div className="w-4 h-4 bg-zinc-card/50 rounded animate-pulse flex-shrink-0" />
        )}

        {/* Data Cells */}
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div
            key={`cell-${colIndex}`}
            className="h-4 bg-zinc-card/50 rounded animate-pulse"
            style={{
              flex: colIndex === 0 ? '2' : '1',
              maxWidth: colIndex === 0 ? '40%' : '25%',
              minWidth: '80px',
            }}
          />
        ))}

        {/* Actions Cell */}
        {hasActions && (
          <div className="flex gap-2 ml-auto flex-shrink-0">
            <div className="w-8 h-8 bg-zinc-card/50 rounded-sm animate-pulse" />
            <div className="w-8 h-8 bg-zinc-card/50 rounded-sm animate-pulse" />
          </div>
        )}
      </div>
    );
  }
);

TableRowSkeleton.displayName = 'TableRowSkeleton';

// --- Pagination Skeleton ---

export interface TablePaginationSkeletonProps {
  className?: string;
}

/**
 * TablePaginationSkeleton - Pagination footer placeholder
 */
export const TablePaginationSkeleton = React.forwardRef<
  HTMLDivElement,
  TablePaginationSkeletonProps
>(({ className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'px-6 py-4 border-t border-white/5 bg-obsidian-outer/30 flex items-center justify-between',
        className
      )}
    >
      {/* Info Text */}
      <div className="h-4 w-48 bg-zinc-card/50 rounded animate-pulse" />

      {/* Pagination Buttons */}
      <div className="flex gap-2">
        <div className="w-16 h-8 bg-zinc-card/50 rounded-sm animate-pulse" />
        <div className="flex gap-1">
          <div className="w-6 h-6 bg-zinc-card/50 rounded-sm animate-pulse" />
          <div className="w-6 h-6 bg-brand text-obsidian-outer rounded-sm animate-pulse" />
          <div className="w-6 h-6 bg-zinc-card/50 rounded-sm animate-pulse" />
        </div>
        <div className="w-16 h-8 bg-zinc-card/50 rounded-sm animate-pulse" />
      </div>
    </div>
  );
});

TablePaginationSkeleton.displayName = 'TablePaginationSkeleton';

// --- Stats Cards Skeleton ---

export interface TableStatsSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * TableStatsSkeleton - Statistics cards placeholder for list pages
 */
export const TableStatsSkeleton = React.forwardRef<HTMLDivElement, TableStatsSkeletonProps>(
  ({ count = 3, className }, ref) => {
    return (
      <div ref={ref} className={cn('grid gap-4 md:grid-cols-3', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-6 border border-white/5 rounded-lg bg-obsidian-card space-y-3"
          >
            <div className="h-5 w-32 bg-zinc-card/50 rounded animate-pulse" />
            <div className="h-8 w-20 bg-zinc-card/50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }
);

TableStatsSkeleton.displayName = 'TableStatsSkeleton';

export default AmberTableSkeleton;
