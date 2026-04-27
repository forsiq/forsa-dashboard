import React from 'react';
import { Folder, CheckCircle2, Heart, Tag } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { AmberCard } from '@core/components/AmberCard';
import { cn } from '@core/lib/utils/cn';
import type { CategoryStats as Stats } from '../types';

// --- Types ---

interface CategoriesStatsProps {
  stats: Stats;
  isLoading?: boolean;
}

// --- Stat Card Component ---

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  className?: string;
  iconClassName?: string;
  isLoading?: boolean;
}

function StatCard({ label, value, icon: Icon, className, iconClassName, isLoading }: StatCardProps) {
  return (
    <AmberCard className="!p-5 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] shadow-sm hover:border-white/10 transition-all group overflow-hidden relative">
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <span className="text-xs font-bold text-zinc-muted uppercase tracking-wider block">
            {label}
          </span>
          {isLoading ? (
            <div className="h-8 w-12 bg-zinc-card/50 rounded animate-pulse mt-1" />
          ) : (
            <span className="text-3xl font-black text-zinc-text tracking-tight tabular-nums leading-none">
              {value}
            </span>
          )}
        </div>
        <div className={cn('p-3 rounded-xl flex-shrink-0', className)}>
          <Icon className={cn('w-5 h-5', iconClassName)} />
        </div>
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-white/10 transition-colors" />
    </AmberCard>
  );
}

// --- Stats Grid Component ---

export function CategoriesStats({ stats, isLoading }: CategoriesStatsProps) {
  const { t } = useLanguage();

  const statCards = [
    {
      label: t('category.total') || 'Total Categories',
      value: stats.total,
      icon: Folder,
      className: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]',
      iconClassName: 'text-[var(--color-warning-text)]',
    },
    {
      label: t('category.active') || 'Active',
      value: stats.active,
      icon: CheckCircle2,
      className: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
      iconClassName: 'text-[var(--color-success-text)]',
    },
    {
      label: t('category.inactive') || 'Inactive',
      value: stats.inactive,
      icon: Heart,
      className: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]',
      iconClassName: 'text-[var(--color-danger-text)]',
    },
    {
      label: t('category.main') || 'Main Categories',
      value: stats.withParent || 0,
      icon: Tag,
      className: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]',
      iconClassName: 'text-[var(--color-warning-text)]',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, idx) => (
        <StatCard
          key={idx}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          className={stat.className}
          iconClassName={stat.iconClassName}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

// --- Compact Stats Variant ---

interface CompactCategoriesStatsProps {
  stats: Stats;
  isLoading?: boolean;
}

/**
 * CompactCategoriesStats - Smaller stats row for embedded use
 */
export function CompactCategoriesStats({ stats, isLoading }: CompactCategoriesStatsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: t('common.total') || 'Total', value: stats.total },
        { label: t('status.active') || 'Active', value: stats.active },
        { label: t('status.inactive') || 'Inactive', value: stats.inactive },
        { label: t('category.subcategories') || 'Subcategories', value: stats.withParent },
      ].map((stat) => (
        <div key={stat.label} className="text-start p-4 border border-white/5 rounded-xl bg-obsidian-card hover:border-white/10 transition-all">
          <p className="text-[10px] text-zinc-muted font-black uppercase tracking-widest h-4">
            {stat.label}
          </p>
          {isLoading ? (
            <div className="h-5 w-10 bg-zinc-card/50 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-xl font-black text-zinc-text tabular-nums mt-0.5">
              {stat.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default CategoriesStats;
