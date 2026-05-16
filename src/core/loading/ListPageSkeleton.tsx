import React from 'react';
import { CardGridSkeleton } from '@core/components/Loading/AmberCardSkeleton';

interface ListPageSkeletonProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  showStats?: boolean;
  className?: string;
}

export function ListPageSkeleton({
  count = 6,
  columns = 3,
  showStats = false,
  className = '',
}: ListPageSkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/[0.02] rounded-xl border border-white/[0.05]" />
          ))}
        </div>
      )}
      <CardGridSkeleton count={count} columns={columns} />
    </div>
  );
}
