import React, { useEffect, useState } from 'react';
import { cn } from '@core/lib/utils/cn';

export interface ReportChartFrameProps {
  children: React.ReactNode;
  className?: string;
  heightClass?: string;
}

/**
 * Defers Recharts mount until after client paint to avoid ResponsiveContainer DOM conflicts.
 */
export function ReportChartFrame({
  children,
  className,
  heightClass = 'h-[320px]',
}: ReportChartFrameProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn('w-full min-w-0', heightClass, className)}>
      {mounted ? (
        children
      ) : (
        <div className="h-full w-full rounded-lg bg-white/[0.03] animate-pulse" aria-hidden />
      )}
    </div>
  );
}
