/**
 * SmartTable Component
 *
 * A unified table component that consolidates all table patterns:
 * - Full variant: Complete table with all features
 * - Compact variant: Simplified for sidebars/modals
 * - Inline variant: Minimal for embedded use
 *
 * @example
 * <SmartTable
 *   service={categoryServiceConfig}
 *   variant="full"
 *   enableRowActions={true}
 *   enableSelection={true}
 *   enableExpansion={true}
 *   onRowClick={(category) => navigate(`/categories/${category.id}`)}
 * />
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search,
  CheckSquare,
  Square,
  Loader2,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';
import { DataTable, type Column } from './DataTable';
import { StatusBadge } from './StatusBadge';
import { AmberButton } from '../AmberButton';
import { AmberCard } from '../AmberCard';
import { AmberTableSkeleton } from '../Loading/AmberTableSkeleton';

// ============================================================================
// Types
// ============================================================================

export type SmartTableVariant = 'full' | 'compact' | 'inline';

export interface SmartTableProps<T = any> {
  // Data
  data: T[];
  columns: Column<T>[];
  keyField?: keyof T | string;

  // Variant
  variant?: SmartTableVariant;

  // Features
  enableRowActions?: boolean;
  enableSelection?: boolean;
  enableExpansion?: boolean;
  enablePagination?: boolean;
  enableSorting?: boolean;

  // Configuration
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;

  // Callbacks
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onSelectionChange?: (selectedIds: string[]) => void;

  // Actions
  rowActions?: RowAction<T>[];
  bulkActions?: BulkAction<T>[];
  expandComponent?: (row: T) => React.ReactNode;

  // Styling
  className?: string;
}

export interface RowAction<T = any> {
  label: string;
  icon?: React.ElementType;
  onClick: (row: T) => void;
  variant?: 'default' | 'danger' | 'success';
  showInMenu?: boolean;
}

export interface BulkAction<T = any> {
  label: string;
  icon?: React.ElementType;
  onClick: (selectedIds: string[], selectedRows: T[]) => void;
  variant?: 'default' | 'danger' | 'success';
}

// ============================================================================
// Default Row Actions
// ============================================================================

export const createDefaultRowActions = <T extends Record<string, any>>(
  onEdit?: (row: T) => void,
  onDelete?: (row: T) => void,
  onView?: (row: T) => void
): RowAction<T>[] => {
  const actions: RowAction<T>[] = [];

  if (onView) {
    actions.push({
      label: 'common.view' as string,
      icon: Eye,
      onClick: onView,
    });
  }

  if (onEdit) {
    actions.push({
      label: 'common.edit' as string,
      icon: Edit,
      onClick: onEdit,
    });
  }

  if (onDelete) {
    actions.push({
      label: 'common.delete' as string,
      icon: Trash2,
      onClick: onDelete,
      variant: 'danger',
    });
  }

  return actions;
};

// ============================================================================
// Main Component
// ============================================================================

export function SmartTable<T extends Record<string, any>>({
  data,
  columns,
  keyField = 'id',
  variant = 'full',
  enableRowActions = true,
  enableSelection = true,
  enableExpansion = false,
  enablePagination = true,
  enableSorting = true,
  pageSize = 10,
  loading = false,
  emptyMessage,
  onRowClick,
  onEdit,
  onDelete,
  onSelectionChange,
  rowActions: customRowActions,
  bulkActions,
  expandComponent,
  className,
}: SmartTableProps<T>) {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';

  // Combine default and custom row actions
  const allRowActions = useMemo(() => {
    if (customRowActions) return customRowActions;
    return createDefaultRowActions(onEdit, onDelete, onRowClick);
  }, [customRowActions, onEdit, onDelete, onRowClick]);

  // Render different variants
  if (variant === 'compact') {
    return <CompactTable {...{ data, columns, keyField, loading, emptyMessage, onRowClick, onEdit, onDelete, allRowActions, className }} />;
  }

  if (variant === 'inline') {
    return <InlineTable {...{ data, columns, keyField, loading, emptyMessage, className }} />;
  }

  // Full variant - use existing DataTable
  return (
    <DataTable
      columns={columns}
      data={data}
      keyField={keyField as keyof T}
      sortable={enableSorting}
      selectable={enableSelection}
      expandable={enableExpansion}
      pagination={enablePagination}
      pageSize={pageSize}
      loading={loading}
      onRowClick={onRowClick}
      onSelectionChange={onSelectionChange}
      rowActions={enableRowActions ? allRowActions : undefined}
      bulkActions={bulkActions}
      expandComponent={expandComponent}
      emptyMessage={emptyMessage || t('common.no_data') || 'No data available'}
      className={className}
    />
  );
}

// ============================================================================
// Compact Table Variant
// ============================================================================

interface CompactTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField?: keyof T | string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  allRowActions: RowAction<T>[];
  className?: string;
}

function CompactTable<T extends Record<string, any>>({
  data,
  columns,
  keyField = 'id',
  loading,
  emptyMessage,
  onRowClick,
  onEdit,
  onDelete,
  allRowActions,
  className,
}: CompactTableProps<T>) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-zinc-card/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <AmberCard className="flex items-center justify-center py-12">
        <div className="text-center">
          <Search className="w-12 h-12 mx-auto text-zinc-muted/20 mb-4" />
          <p className="text-sm text-zinc-muted font-bold uppercase tracking-widest">
            {emptyMessage || t('common.no_results') || 'No results found'}
          </p>
        </div>
      </AmberCard>
    );
  }

  return (
    <div className={cn('divide-y divide-[var(--color-border)]', className)}>
      {data.map((row) => {
        const id = String(row[keyField as keyof T]);
        const primaryColumn = columns.find(c => c.key === 'name' || c.key === 'title') || columns[0];

        return (
          <div
            key={id}
            className={cn(
              'flex items-center justify-between py-3 hover:bg-[var(--color-obsidian-hover)] transition-colors px-4 rounded-xl group',
              onRowClick && 'cursor-pointer'
            )}
            onClick={() => onRowClick?.(row)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {primaryColumn?.render ? (
                <div className="truncate">{primaryColumn.render(row)}</div>
              ) : (
                <div className="text-sm font-medium text-zinc-text truncate">
                  {String(row[primaryColumn?.key as keyof T] || id)}
                </div>
              )}
            </div>

            {(onEdit || onDelete) && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(row);
                    }}
                    className="p-2 text-zinc-muted hover:text-brand hover:bg-[var(--color-obsidian-hover)] rounded transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(row);
                    }}
                    className="p-2 text-zinc-muted hover:text-danger hover:bg-[var(--color-obsidian-hover)] rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Inline Table Variant
// ============================================================================

interface InlineTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField?: keyof T | string;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

function InlineTable<T extends Record<string, any>>({
  data,
  columns,
  keyField = 'id',
  loading,
  emptyMessage,
  className,
}: InlineTableProps<T>) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-brand" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-muted text-sm">
        {emptyMessage || t('common.no_data') || 'No data'}
      </div>
    );
  }

  return (
    <table className={cn('w-full text-sm', className)}>
      <thead>
        <tr className="border-b border-[var(--color-border)]">
          {columns.slice(0, 3).map((column) => (
            <th
              key={String(column.key)}
              className={cn(
                'py-2 px-3 text-left font-medium text-zinc-muted uppercase text-xs tracking-wider',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right'
              )}
            >
              {String(column.label)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--color-border)]">
        {data.map((row) => (
          <tr key={String(row[keyField as keyof T])} className="hover:bg-[var(--color-obsidian-hover)]">
            {columns.slice(0, 3).map((column) => (
              <td
                key={String(column.key)}
                className={cn(
                  'py-2 px-3 text-zinc-text',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
              >
                {column.render ? column.render(row) : String(row[column.key as keyof T] || '-')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============================================================================
// Export Default
// ============================================================================

export default SmartTable;

// Re-export DataTable types for convenience
export type { Column, Action as DataTableAction } from './DataTable';
