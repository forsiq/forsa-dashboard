/**
 * StatsGrid & StatCard - Unified Stats Display Components
 *
 * Renders statistics cards in a responsive grid with consistent styling.
 * Default style: Categories-inspired with blur circle decoration, CSS variables.
 *
 * @example
 * <StatsGrid
 *   stats={[
 *     { label: 'Total', value: 100, icon: Users, color: 'brand', description: 'All items' },
 *     { label: 'Active', value: 75, icon: CheckCircle, color: 'success', change: 12 },
 *   ]}
 * />
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';

// ============================================================================
// Color System
// ============================================================================

export type StatColor =
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'primary'
  | 'muted';

const COLOR_MAP: Record<StatColor, { text: string; bg: string; border: string; hover: string }> = {
  brand: {
    text: 'text-brand',
    bg: 'bg-brand/10',
    border: 'border-brand/20',
    hover: 'hover:border-brand/30',
  },
  success: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    hover: 'hover:border-emerald-500/30',
  },
  warning: {
    text: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    hover: 'hover:border-warning/30',
  },
  danger: {
    text: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/20',
    hover: 'hover:border-danger/30',
  },
  info: {
    text: 'text-info',
    bg: 'bg-info/10',
    border: 'border-info/20',
    hover: 'hover:border-info/30',
  },
  primary: {
    text: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    hover: 'hover:border-primary/30',
  },
  muted: {
    text: 'text-zinc-muted',
    bg: 'bg-white/5',
    border: 'border-white/5',
    hover: 'hover:border-white/10',
  },
};

// ============================================================================
// Types
// ============================================================================

export interface StatConfig {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: StatColor;
  description?: string;
  change?: number;
  href?: string;
  onClick?: () => void;
  /** Override the entire card className */
  cardClassName?: string;
  /** Override the icon container className */
  iconClassName?: string;
  /** Override the value className */
  valueClassName?: string;
  /** Override the label className */
  labelClassName?: string;
  /** Custom content rendered below the main stat */
  footer?: React.ReactNode;
  /** Hide the blur decoration circle */
  hideDecoration?: boolean;
}

export interface StatsGridProps {
  stats: StatConfig[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Default cardClassName applied to all stats (can be overridden per-stat) */
  cardClassName?: string;
  /** Default iconClassName applied to all stats (can be overridden per-stat) */
  iconClassName?: string;
}

// ============================================================================
// StatCard Component
// ============================================================================

interface StatCardProps extends StatConfig {
  size?: 'sm' | 'md' | 'lg';
  defaultCardClassName?: string;
  defaultIconClassName?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = 'brand',
  description,
  change,
  href,
  onClick,
  size = 'md',
  cardClassName,
  iconClassName,
  valueClassName,
  labelClassName,
  footer,
  hideDecoration = false,
  defaultCardClassName,
  defaultIconClassName,
}: StatCardProps) {
  const { t } = useLanguage();
  const colors = COLOR_MAP[color] || COLOR_MAP.brand;

  // Size-based configs
  const sizeConfig = {
    sm: { padding: '!p-4', iconPad: 'p-2', iconSize: 'w-4 h-4', valueSize: 'text-xl', labelSize: 'text-[10px]' },
    md: { padding: '!p-5', iconPad: 'p-3', iconSize: 'w-5 h-5', valueSize: 'text-3xl', labelSize: 'text-[10px]' },
    lg: { padding: '!p-6', iconPad: 'p-4', iconSize: 'w-6 h-6', valueSize: 'text-4xl', labelSize: 'text-xs' },
  }[size];

  const content = (
    <>
      {/* Label */}
      <p className={cn(
        'font-black uppercase tracking-widest block mb-1',
        sizeConfig.labelSize,
        labelClassName || 'text-zinc-muted'
      )}>
        {label}
      </p>

      {/* Value + Icon row */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className={cn(
            'font-black tabular-nums leading-none tracking-tight',
            sizeConfig.valueSize,
            valueClassName || 'text-zinc-text'
          )}>
            {value}
          </p>
          {description && (
            <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest mt-2 truncate">
              {description}
            </p>
          )}
        </div>

        {Icon && (
          <div className={cn(
            'rounded-xl flex-shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
            sizeConfig.iconPad,
            colors.bg,
            colors.border,
            'border',
            iconClassName || defaultIconClassName
          )}>
            <Icon className={cn('stroke-[2.5]', sizeConfig.iconSize, colors.text)} />
          </div>
        )}
      </div>

      {/* Change indicator */}
      {change !== undefined && (
        <div className={cn(
          'flex items-center gap-1.5 border-t border-white/[0.03]',
          size === 'sm' && 'mt-3 pt-3',
          size === 'md' && 'mt-4 pt-4',
          size === 'lg' && 'mt-5 pt-5'
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

      {/* Custom footer */}
      {footer && (
        <div className={cn(
          size === 'sm' && 'mt-3',
          size === 'md' && 'mt-4',
          size === 'lg' && 'mt-5'
        )}>
          {footer}
        </div>
      )}
    </>
  );

  // Base card classes: Categories-inspired with blur circle, CSS vars
  const baseCardClasses = cn(
    'rounded-xl transition-all duration-300 group overflow-hidden relative cursor-default',
    'bg-[var(--color-obsidian-card)] border border-[var(--color-border)] shadow-sm',
    colors.hover,
    sizeConfig.padding,
    cardClassName || defaultCardClassName
  );

  const card = (
    <div className={cn(baseCardClasses, 'group')}>
      {/* Blur circle decoration */}
      {!hideDecoration && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-focus-within:bg-white/10 transition-all duration-1000 pointer-events-none" />
      )}
      <div className="relative z-10">
        {content}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block transition-transform hover:scale-[1.02]">
        {card}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="text-left w-full transition-transform hover:scale-[1.02]">
        {card}
      </button>
    );
  }

  return card;
}

// ============================================================================
// StatsGrid Component
// ============================================================================

export function StatsGrid({
  stats,
  columns = 4,
  size = 'md',
  className,
  cardClassName,
  iconClassName,
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
    <div className={cn('grid gap-6', gridCols, className)}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          {...stat}
          size={size}
          defaultCardClassName={cardClassName}
          defaultIconClassName={iconClassName}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Convenience: pre-built stat presets
// ============================================================================

export const STAT_COLORS = COLOR_MAP;

export default StatsGrid;
