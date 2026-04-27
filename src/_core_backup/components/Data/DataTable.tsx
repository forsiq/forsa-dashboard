import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Search,
  CheckSquare,
  Square,
  Loader2,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';
import type { Column, Action, BulkAction, ViewMode, DataTableProps } from './DataTable.types';
import { DataCard } from './DataCard';
import { ContextMenu, useContextMenu } from './ContextMenu';
import { Pagination } from './Pagination';
import { BulkActionBar } from './BulkActionBar';

export type { Column, Action, BulkAction, ViewMode, DataTableProps };

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id',
  sortable = false,
  selectable = false,
  expandable = false,
  pagination = false,
  pageSize = 10,
  totalItems,
  currentPage: externalCurrentPage,
  onPageChange,
  loading = false,
  onRowClick,
  onSelectionChange,
  rowActions,
  bulkActions,
  expandComponent,
  emptyMessage = 'No data available',
  className,
  viewMode: externalViewMode,
  showViewToggle = false,
  onViewModeChange,
  gridCols = 'auto',
  renderCard,
}: DataTableProps<T>) {
  const { t, dir } = useLanguage();
  const rows = Array.isArray(data) ? data : [];

  // --- State ---
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('table');
  const viewMode = externalViewMode ?? internalViewMode;
  const [internalPage, setInternalPage] = useState(1);
  const currentPage = externalCurrentPage ?? internalPage;
  const handlePageChange = onPageChange ?? setInternalPage;
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const { contextMenu, setContextMenu } = useContextMenu<T>({ rows, keyField });

  const handleViewModeChange = (mode: ViewMode) => {
    setInternalViewMode(mode);
    onViewModeChange?.(mode);
  };

  // Click outside to close actions menu
  useEffect(() => {
    const handleClickOutside = () => setOpenActionId(null);
    if (openActionId) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [openActionId]);

  // --- Sorting ---
  const sortedData = useMemo(() => {
    if (!sortConfig || !sortable) return rows;
    return [...rows].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, sortConfig, sortable]);

  // --- Pagination ---
  const isServerPagination = !!onPageChange;
  const paginatedData = useMemo(() => {
    if (!pagination || isServerPagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pagination, pageSize, isServerPagination]);

  const resolvedTotalItems = totalItems ?? sortedData.length;
  const totalPages = Math.ceil(resolvedTotalItems / pageSize);

  // --- Handlers ---
  const handleSort = (key: string) => {
    if (!sortable) return;
    setSortConfig((current) => {
      if (current?.key === key) return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      return { key, direction: 'asc' };
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = paginatedData.map((row) => String(row[keyField as keyof T]));
      setSelectedIds(new Set(allIds));
      onSelectionChange?.(allIds);
    }
  };

  const handleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
    onSelectionChange?.(Array.from(newSet) as string[]);
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  // --- Grid helpers ---
  const gridColsClass = useMemo(() => {
    if (gridCols === 1) return 'grid-cols-1';
    if (gridCols === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (gridCols === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    if (gridCols === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }, [gridCols]);

  const cardFields = useMemo(() => columns.filter((c) => !c.hideInCard), [columns]);
  const titleCol = cardFields.find((c) => c.cardTitle);
  const subtitleCol = cardFields.find((c) => c.cardSubtitle);
  const mediaCol = cardFields.find((c) => c.cardMedia);
  const badgeCols = cardFields.filter((c) => c.cardBadge);
  const detailCols = cardFields.filter((c) => !c.cardTitle && !c.cardSubtitle && !c.cardMedia && !c.cardBadge);

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-muted animate-pulse">
        <Loader2 className="w-8 h-8 mb-4 animate-spin text-brand/40" />
        <p className="text-xs font-bold uppercase tracking-widest">{t('common.loading_data') || 'Loading Data...'}</p>
      </div>
    );
  }

  // --- Empty state ---
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-20 text-zinc-muted opacity-50">
      <Search className="w-12 h-12 mb-3 stroke-1" />
      <p className="text-xs uppercase tracking-widest font-bold">{emptyMessage}</p>
    </div>
  );

  // --- Row Actions Dropdown ---
  const renderRowActionsDropdown = (id: string, row: T) => {
    if (!rowActions) return null;
    const visibleActions = rowActions.filter((a) => {
      const label = typeof a.label === 'function' ? a.label(row) : a.label;
      return label != null;
    });
    return (
      <td className="px-4 py-3 text-right overflow-visible" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setOpenActionId(openActionId === id ? null : id); }}
            className={cn(
              'p-2 rounded-sm transition-all',
              openActionId === id ? 'bg-white/10 text-zinc-text' : 'text-zinc-muted hover:text-zinc-text hover:bg-white/5',
            )}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {openActionId === id && (
            <div
              className={cn(
                'absolute top-0 w-40 bg-obsidian-card border border-white/10 rounded-sm shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100',
                dir === 'rtl' ? 'left-8 origin-top-left' : 'right-8 origin-top-right',
              )}
            >
              {visibleActions.map((action, i) => {
                const actionLabel = typeof action.label === 'function' ? action.label(row) : action.label;
                const ActionIcon = action.icon
                  ? typeof action.icon === 'function' ? (action.icon as (row: T) => React.ElementType)(row) : action.icon
                  : null;
                return (
                  <button
                    key={i}
                    onClick={() => { action.onClick(row); setOpenActionId(null); }}
                    className={cn(
                      'w-full text-start px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group/item transition-colors',
                      action.variant === 'danger' ? 'text-danger hover:bg-danger/10' : 'text-zinc-text hover:bg-white/5',
                    )}
                  >
                    {ActionIcon && <ActionIcon className="w-3.5 h-3.5 opacity-70 group-hover/item:opacity-100" />}
                    {actionLabel}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </td>
    );
  };

  // --- Sort Icon ---
  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortConfig?.key === colKey) {
      return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
    }
    return <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />;
  };

  return (
    <div className={cn('flex flex-col bg-obsidian-panel border border-white/5 rounded-lg shadow-sm', className)}>
      {/* View Toggle */}
      {showViewToggle && (
        <div className="flex items-center justify-end px-4 py-3 border-b border-white/5">
          <div className="flex items-center bg-obsidian-outer/50 rounded-lg p-0.5 border border-white/5">
            <button
              onClick={() => handleViewModeChange('table')}
              className={cn('p-2 rounded-md transition-all', viewMode === 'table' ? 'bg-white/10 text-zinc-text shadow-sm' : 'text-zinc-muted hover:text-zinc-text')}
              title={t('common.table_view') || 'Table View'}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={cn('p-2 rounded-md transition-all', viewMode === 'grid' ? 'bg-white/10 text-zinc-text shadow-sm' : 'text-zinc-muted hover:text-zinc-text')}
              title={t('common.grid_view') || 'Grid View'}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="p-4">
          {paginatedData.length > 0 ? (
            <div className={cn('grid gap-4', gridColsClass)}>
              {paginatedData.map((row) => {
                const id = String(row[keyField as keyof T]);
                return renderCard ? (
                  <div key={id}>{renderCard(row, cardFields, rowActions)}</div>
                ) : (
                  <DataCard
                    key={id}
                    row={row}
                    id={id}
                    keyField={keyField}
                    columns={columns}
                    cardFields={cardFields}
                    titleCol={titleCol}
                    subtitleCol={subtitleCol}
                    mediaCol={mediaCol}
                    badgeCols={badgeCols}
                    detailCols={detailCols}
                    rowActions={rowActions}
                    isSelected={selectedIds.has(id)}
                    openActionId={openActionId}
                    onRowClick={onRowClick}
                    onSelectRow={handleSelectRow}
                    onToggleAction={(id) => setOpenActionId(openActionId === id ? null : id)}
                  />
                );
              })}
            </div>
          ) : (
            emptyState
          )}
        </div>
      ) : (
        /* Table View */
        <div className={cn('flex-1 min-h-[200px]', openActionId ? 'overflow-visible' : 'overflow-x-auto')}>
          <table className="w-full text-start border-collapse min-w-[800px]">
            <thead className="bg-obsidian-outer/50 border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                {selectable && (
                  <th className="w-12 px-6 py-4 text-center">
                    <button onClick={handleSelectAll} className="text-zinc-muted hover:text-brand transition-colors">
                      {paginatedData.length > 0 && selectedIds.size === paginatedData.length
                        ? <CheckSquare className="w-4 h-4" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                )}
                {expandable && <th className="w-10 px-2"></th>}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-6 py-5 text-[11px] font-black text-zinc-muted uppercase tracking-widest select-none group',
                      col.width,
                      col.align === 'right' ? 'text-end' : col.align === 'center' ? 'text-center' : 'text-start',
                      col.sortable ? 'cursor-pointer hover:text-zinc-text' : '',
                      col.className,
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className={cn('flex items-center gap-2', col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start')}>
                      {col.label}
                      {col.sortable && (
                        <span className="text-zinc-muted/50 group-hover:text-brand transition-colors">
                          <SortIcon colKey={col.key} />
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {rowActions && <th className="w-12 px-4"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => {
                  const id = String(row[keyField as keyof T]);
                  const isSelected = selectedIds.has(id);
                  const isExpanded = expandedIds.has(id);
                  return (
                    <React.Fragment key={id}>
                      <tr
                        className={cn(
                          'group transition-colors overflow-visible border-b border-white/[0.02] last:border-0',
                          onRowClick ? 'cursor-pointer' : '',
                          isSelected ? 'bg-brand/[0.03]' : 'hover:bg-white/[0.02]',
                          isExpanded && 'bg-white/[0.02]',
                        )}
                        onClick={() => onRowClick?.(row)}
                        onContextMenu={(e) => {
                          if (rowActions) {
                            e.preventDefault();
                            const target = e.target as HTMLElement;
                            setContextMenu({
                              x: e.clientX,
                              y: e.clientY,
                              rowId: id,
                              selectedValue: target.innerText || target.textContent || undefined,
                            });
                          }
                        }}
                      >
                        {selectable && (
                          <td className="px-6 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleSelectRow(id)}
                              className={cn('transition-colors', isSelected ? 'text-brand' : 'text-zinc-muted hover:text-zinc-text')}
                            >
                              {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                            </button>
                          </td>
                        )}
                        {expandable && (
                          <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => toggleExpand(id)}
                              className={cn('p-1 rounded-sm text-zinc-muted hover:text-brand hover:bg-white/5 transition-all', isExpanded && 'rotate-90 text-brand')}
                            >
                              <ChevronRight className="w-4 h-4 transition-transform" />
                            </button>
                          </td>
                        )}
                        {columns.map((col) => (
                          <td
                            key={`${id}-${col.key}`}
                            className={cn(
                              'px-6 py-5 text-[15px] font-bold text-zinc-text tracking-tight',
                              col.align === 'right' ? 'text-end' : col.align === 'center' ? 'text-center' : 'text-start',
                              col.className,
                            )}
                          >
                            {col.render ? col.render(row) : row[col.key]}
                          </td>
                        ))}
                        {renderRowActionsDropdown(id, row)}
                      </tr>
                      {expandable && isExpanded && expandComponent && (
                        <tr className="bg-obsidian-outer/30 shadow-inner">
                          <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0) + 1} className="px-6 py-4 border-b border-white/5">
                            {expandComponent(row)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (rowActions ? 1 : 0)} className="px-6 py-20 text-center">
                    {emptyState}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && paginatedData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={resolvedTotalItems}
          onPageChange={handlePageChange}
        />
      )}

      {/* Bulk Actions */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        bulkActions={bulkActions || []}
        selectedIds={selectedIds}
        onClear={() => { setSelectedIds(new Set()); onSelectionChange?.([]); }}
        onAction={(action) => {
          const selectedRows = rows.filter((row) => selectedIds.has(String(row[keyField as keyof T])));
          action.onClick(Array.from(selectedIds), selectedRows);
        }}
      />

      {/* Context Menu */}
      <ContextMenu
        contextMenu={contextMenu}
        rows={rows}
        keyField={keyField}
        rowActions={rowActions || []}
        onAction={(action, row) => action.onClick(row)}
        onClose={() => setContextMenu(null)}
      />
    </div>
  );
}
