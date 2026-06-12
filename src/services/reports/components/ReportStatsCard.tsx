import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { StatValue } from '@core/components/Data/StatValue';
import { cn } from '@core/lib/utils/cn';

interface ReportStatsCardProps {
  label: string;
  value: string | number;
  change?: string | number;
  icon?: LucideIcon;
  color?: string;
  className?: string;
  isRTL?: boolean;
}

/**
 * Shared Stats Card for Report pages
 */
export const ReportStatsCard: React.FC<ReportStatsCardProps> = ({ 
  label, 
  value, 
  change, 
  icon: Icon, 
  color = 'text-brand',
  className,
  isRTL = false
}) => {
  const isPositive = typeof change === 'string' 
    ? !change.startsWith('-') 
    : (change || 0) >= 0;
  
  return (
    <AmberCard className={cn("group hover:border-brand/20 transition-all !p-5 md:!p-6 min-w-0 h-full", className)}>
      <div className={cn(
        "flex items-start justify-between gap-3 min-w-0",
        isRTL && "flex-row-reverse",
      )}>
        <div className="flex flex-col flex-1 min-w-0 text-start">
          <span className="text-[11px] font-black text-zinc-muted uppercase tracking-[0.15em] mb-2 leading-snug line-clamp-2 min-h-[2rem]">
            {label}
          </span>
          <StatValue value={value} className="!text-xl sm:!text-2xl" maxLines={1} />
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-3 h-3 shrink-0 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 shrink-0 text-danger" />
              )}
              <span className={cn(
                "text-[11px] font-bold tabular-nums", 
                isPositive ? "text-success" : "text-danger"
              )}>
                {change}
              </span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={cn(
            'p-3 shrink-0 rounded-xl bg-white/5 border border-white/5 shadow-inner transition-transform group-hover:scale-110 self-center', 
            color
          )}>
            <Icon className="w-5 h-5 stroke-[2.5]" />
          </div>
        )}
      </div>
    </AmberCard>
  );
};
