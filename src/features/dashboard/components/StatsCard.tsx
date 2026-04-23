import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { StatCard as StatCardType } from '../types';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';

interface StatsCardProps {
  stat: StatCardType;
}

const colorClasses = {
  brand: 'text-brand',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger'
};

export const StatsCard: React.FC<StatsCardProps> = ({ stat }) => {
  const { t } = useLanguage();
  
  return (
    <AmberCard className="hover:border-zinc-secondary/20 transition-all">
      <div className="space-y-1">
        <p className="text-xs font-black text-zinc-muted uppercase tracking-widest">
          {stat.title}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-zinc-text tracking-tight">
            {stat.value}
          </p>
          {stat.icon && (
            <div className={cn('p-2.5 rounded-xl bg-white/5 border border-white/5 shadow-inner', colorClasses[stat.color || 'brand'])}>
              {stat.icon}
            </div>
          )}
        </div>
      </div>
      {stat.change !== undefined && (
        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-white/[0.03]">
          {stat.change >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-success" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-danger" />
          )}
          <span className={cn(
            'text-[10px] font-semibold tracking-widest',
            stat.change >= 0 ? 'text-success' : 'text-danger'
          )}>
            {Math.abs(stat.change)}% {t('dash.from_last_month')}
          </span>
        </div>
      )}
    </AmberCard>
  );
};
