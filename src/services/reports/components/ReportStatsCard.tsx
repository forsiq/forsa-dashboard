import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { AmberCard } from '../../../core/components/AmberCard';
import { cn } from '../../../core/lib/utils/cn';

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
    <AmberCard className={cn("group hover:border-brand/20 transition-all !p-6", className)}>
      <div className={cn("flex items-center justify-between gap-4", isRTL && "flex-row-reverse")}>
        <div className={cn("flex flex-col flex-1", isRTL ? "items-end" : "items-start")}>
          <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-1">
            {label}
          </span>
          <span className="text-2xl font-black text-zinc-text tracking-tight tabular-nums leading-tight">
            {value}
          </span>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-3 h-3 text-success" />
              ) : (
                <TrendingDown className="w-3 h-3 text-danger" />
              )}
              <span className={cn(
                "text-[10px] font-bold", 
                isPositive ? "text-success" : "text-danger"
              )}>
                {change}
              </span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={cn(
            'p-3 rounded-xl bg-white/5 border border-white/5 shadow-inner transition-transform group-hover:scale-110', 
            color
          )}>
            <Icon className="w-5 h-5 stroke-[2.5]" />
          </div>
        )}
      </div>
    </AmberCard>
  );
};
