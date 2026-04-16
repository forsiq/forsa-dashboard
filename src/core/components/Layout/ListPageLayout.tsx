/**
 * ListPageLayout Component
 *
 * A standard list page layout that includes:
 * - PageHeader with title and actions
 * - StatsGrid for statistics
 * - Filter section
 * - Content area (usually a table)
 *
 * @example
 * <ListPageLayout
 *   title="Categories"
 *   description="Manage your product categories"
 *   stats={statsConfig}
 *   filters={<FilterPanel />}
 *   actionButton={<NewButton />}
 * >
 *   <SmartTable {...tableProps} />
 * </ListPageLayout>
 */

import React, { ReactNode } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';
import { PageHeader, NewPageButton, type PageHeaderProps, type BreadcrumbItem } from './PageHeader';
import { StatsGrid, type StatConfig, type StatsGridProps } from './StatsGrid';

// ============================================================================
// Types
// ============================================================================

export interface ListPageLayoutProps {
  // Header
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
  backHref?: string;

  // Actions
  actionButton?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;

  // Stats
  stats?: StatConfig[];
  statsColumns?: 1 | 2 | 3 | 4 | 5 | 6;
  statsLoading?: boolean;

  // Filters
  filters?: ReactNode;
  filterTabs?: Array<{ label: string; value: string; count?: number }>;
  activeFilter?: string;
  onFilterChange?: (value: string) => void;

  // Content
  children: ReactNode;

  // Styling
  className?: string;
  contentClassName?: string;
}

// ============================================================================
// Filter Tabs Component
// ============================================================================

interface FilterTabsProps {
  tabs: Array<{ label: string; value: string; count?: number }>;
  activeValue: string;
  onChange: (value: string) => void;
  className?: string;
}

function FilterTabs({ tabs, activeValue, onChange, className }: FilterTabsProps) {
  const { dir } = useLanguage();

  return (
    <div className={cn(
      'flex items-center bg-[var(--color-obsidian-card)] border border-[var(--color-border)] p-1.5 rounded-xl shadow-sm',
      className
    )}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-6 py-2.5 text-sm font-bold transition-colors rounded-lg relative',
            activeValue === tab.value
              ? 'bg-[var(--color-brand)] text-black shadow-sm'
              : 'text-zinc-muted hover:text-zinc-text hover:bg-[var(--color-obsidian-hover)]'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'ml-2 px-2 py-0.5 rounded-full text-xs font-black',
              activeValue === tab.value
                ? 'bg-black/20 text-black'
                : 'bg-zinc-card text-zinc-muted'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Main ListPageLayout Component
// ============================================================================

export function ListPageLayout({
  title,
  description,
  breadcrumbs,
  showBackButton,
  backHref,
  actionButton,
  actionLabel,
  actionHref,
  actionOnClick,
  stats,
  statsColumns = 4,
  statsLoading,
  filters,
  filterTabs,
  activeFilter = 'all',
  onFilterChange,
  children,
  className,
  contentClassName,
}: ListPageLayoutProps) {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  return (
    <div className={cn('space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700', className)} dir={dir}>
      {/* Page Header */}
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        showBackButton={showBackButton}
        backHref={backHref}
        actions={actionButton || (actionLabel && (
          <NewPageButton
            label={actionLabel}
            href={actionHref}
            onClick={actionOnClick}
          />
        ))}
      />

      {/* Stats Grid */}
      {stats && stats.length > 0 && (
        <StatsGrid
          stats={statsLoading ? Array.from({ length: statsColumns }, (_, i) => ({
            label: '...',
            value: '—',
          })) : stats}
          columns={statsColumns}
        />
      )}

      {/* Filter Section */}
      {(filters || filterTabs) && (
        <div className={cn(
          'flex flex-col md:flex-row items-center gap-4 pt-2',
          isRTL ? 'text-right' : 'text-left'
        )}>
          {/* Filter Tabs */}
          {filterTabs && onFilterChange && (
            <FilterTabs
              tabs={filterTabs}
              activeValue={activeFilter}
              onChange={onFilterChange}
            />
          )}

          {/* Custom Filters */}
          {filters && (
            <div className="flex-1 w-full md:w-auto">
              {filters}
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className={cn(
        'bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden',
        contentClassName
      )}>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Export Default
// ============================================================================

export default ListPageLayout;
