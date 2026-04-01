/**
 * StatsGrid Component
 *
 * A reusable stats display component that shows statistics cards in a grid.
 * Supports different sizes, colors, and icons.
 *
 * @example
 * <StatsGrid
 *   stats={[
 *     { label: 'Total', value: '100', icon: Users, color: 'text-brand' },
 *     { label: 'Active', value: '75', icon: CheckCircle, color: 'text-success' },
 *   ]}
 *   columns={4}
 * />
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';
import { AmberCard } from '../AmberCard';

// ============================================================================
// Types
// ============================================================================

export interface StatConfig {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  change?: number;
  href?: string;
  onClick?: () => void;
}

export interface StatsGridProps {
  stats: StatConfig[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
  statClassName?: string;
}

// ============================================================================
// StatCard Component
// ============================================================================

interface StatCardProps extends StatConfig {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = 'text-brand',
  change,
  href,
  onClick,
  size = 'md',
  variant = 'default',
  className,
}: StatCardProps) {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';

  const content = (
    <>
      <div className={cn(
        'flex items-center justify-between gap-4',
        variant === 'compact' && 'gap-2'
      )}>
        <div className="flex flex-col items-center flex-1">
          <p className={cn(
            'font-black uppercase tracking-tighter leading-none',
            size === 'sm' && 'text-[8px] mb-0.5',
            size === 'md' && 'text-[10px] mb-1',
            size === 'lg' && 'text-xs mb-1.5',
            'text-zinc-muted'
          )}>
            {label}
          </p>
          <p className={cn(
            'font-black tabular-nums leading-none',
            size === 'sm' && 'text-xl',
            size === 'md' && 'text-3xl',
            size === 'lg' && 'text-4xl',
            'text-zinc-text'
          )}>
            {value}
          </p>
        </div>

        {Icon && (
          <div className={cn(
            'rounded-xl shadow-inner flex-shrink-0',
            size === 'sm' && 'p-2',
            size === 'md' && 'p-3',
            size === 'lg' && 'p-4',
            'bg-white/5 border border-white/5',
            color
          )}>
            <Icon className={cn(
              'stroke-[2.5]',
              size === 'sm' && 'w-4 h-4',
              size === 'md' && 'w-5 h-5',
              size === 'lg' && 'w-6 h-6'
            )} />
          </div>
        )}
      </div>

      {change !== undefined && variant !== 'minimal' && (
        <div className={cn(
          'flex items-center gap-1.5',
          size === 'sm' && 'mt-2 pt-2',
          size === 'md' && 'mt-3 pt-3',
          size === 'lg' && 'mt-4 pt-4',
          'border-t border-white/[0.03]'
        )}>
          {change >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-success" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-danger" />
          )}
          <span className={cn(
            'text-[10px] font-black uppercase tracking-widest',
            change >= 0 ? 'text-success' : 'text-danger'
          )}>
            {Math.abs(change)}% {t('dash.from_last_month') || 'from last month'}
          </span>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={cn('block transition-transform hover:scale-[1.02]', className)}>
        <AmberCard className={cn(
          'hover:border-[var(--color-brand)]/30 transition-all',
          size === 'sm' && '!p-4',
          size === 'md' && '!p-6',
          size === 'lg' && '!p-8'
        )}>
          {content}
        </AmberCard>
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn('text-left w-full transition-transform hover:scale-[1.02]', className)}
      >
        <AmberCard className={cn(
          'hover:border-[var(--color-brand)]/30 transition-all cursor-pointer',
          size === 'sm' && '!p-4',
          size === 'md' && '!p-6',
          size === 'lg' && '!p-8'
        )}>
          {content}
        </AmberCard>
      </button>
    );
  }

  return (
    <AmberCard className={cn(
      'hover:border-[var(--color-brand)]/30 transition-all',
      size === 'sm' && '!p-4',
      size === 'md' && '!p-6',
      size === 'lg' && '!p-8',
      className
    )}>
      {content}
    </AmberCard>
  );
}

// ============================================================================
// StatsGrid Component
// ============================================================================

export function StatsGrid({
  stats,
  columns = 4,
  size = 'md',
  variant = 'default',
  className,
  statClassName,
}: StatsGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  }[columns];

  return (
    <div className={cn('grid gap-4', gridCols, className)}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          {...stat}
          size={size}
          variant={variant}
          className={statClassName}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Export Default
// ============================================================================

export default StatsGrid;
