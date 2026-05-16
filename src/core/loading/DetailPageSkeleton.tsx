import React from 'react';

interface DetailPageSkeletonProps {
  className?: string;
}

export function DetailPageSkeleton({ className = '' }: DetailPageSkeletonProps) {
  return (
    <div className={`max-w-[1600px] mx-auto p-6 space-y-8 ${className}`}>
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-white/5 rounded w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[500px] bg-white/[0.02] rounded-xl border border-white/[0.05]" />
          <div className="space-y-4">
            <div className="h-40 bg-white/[0.02] rounded-xl border border-white/[0.05]" />
            <div className="h-40 bg-white/[0.02] rounded-xl border border-white/[0.05]" />
          </div>
        </div>
      </div>
    </div>
  );
}
