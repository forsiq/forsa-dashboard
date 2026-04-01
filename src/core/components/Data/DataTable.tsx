import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Search,
  CheckSquare,
  Square,
  Loader2,
  X,
  Copy,
  Check
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';

// --- Types ---

export interface Column<T = any> {
  key: string;
  label: string | React.ReactNode;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

export interface Action<T = any> {
  label: string;
  icon?: React.ElementType;
  onClick: (row: T) => void;
  variant?: 'default' | 'danger' | 'success';
}

export interface BulkAction<T = any> {
  label: string;
  icon?: React.ElementType;
  onClick: (selectedIds: string[], selectedRows: T[]) => void;
  variant?: 'default' | 'danger' | 'success';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: keyof T; // Default to 'id'
  sortable?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  rowActions?: Action<T>[];
  bulkActions?: BulkAction<T>[];
  expandComponent?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id',
  sortable = false,
  selectable = false,
  expandable = false,
  pagination = false,
  pageSize = 10,
  loading = false,
  onRowClick,
  onSelectionChange,
  rowActions,
  bulkActions,
  expandComponent,
  emptyMessage = "No data available",
  className
}: DataTableProps<T>) {
  const { t, dir } = useLanguage();
  // --- State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; rowId: string; selectedValue?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Close context menu on scroll or click outside
  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, []);

  // --- Sorting ---
  const sortedData = useMemo(() => {
    if (!sortConfig || !sortable) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig, sortable]);

  // --- Pagination ---
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pagination, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // --- Handlers ---

  const handleSort = (key: string) => {
    if (!sortable) return;
    setSortConfig(current => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = paginatedData.map(row => String(row[keyField as keyof T]));
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

  // Click outside to close actions menu
  useEffect(() => {
    const handleClickOutside = () => setOpenActionId(null);
    if (openActionId) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [openActionId]);

  // --- Render ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-muted animate-pulse">
        <Loader2 className="w-8 h-8 mb-4 animate-spin text-brand/40" />
        <p className="text-xs font-bold uppercase tracking-widest">{t('common.loading_data') || 'Loading Data...'}</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col bg-obsidian-panel border border-white/5 rounded-lg shadow-sm", className)}>

      {/* Table Container */}
      <div className={cn("flex-1 min-h-[200px]", openActionId ? "overflow-visible" : "overflow-x-auto")}>
        <table className="w-full text-start border-collapse min-w-[800px]">
          <thead className="bg-obsidian-outer/50 border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              {/* Checkbox Column */}
              {selectable && (
                <th className="w-12 px-6 py-4 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-zinc-muted hover:text-brand transition-colors"
                  >
                    {paginatedData.length > 0 && selectedIds.size === paginatedData.length
                      ? <CheckSquare className="w-4 h-4" />
                      : <Square className="w-4 h-4" />
                    }
                  </button>
                </th>
              )}

              {/* Expansion Column */}
              {expandable && <th className="w-10 px-2"></th>}

              {/* Data Columns */}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-6 py-4 text-[11px] font-black text-zinc-muted uppercase tracking-[0.1em] select-none group",
                    col.width,
                    col.align === 'right' ? 'text-end' :
                      col.align === 'center' ? 'text-center' :
                        'text-start',
                    col.sortable ? 'cursor-pointer hover:text-zinc-text' : '',
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={cn(
                    "flex items-center gap-2",
                    col.align === 'right' ? 'justify-end' :
                      col.align === 'center' ? 'justify-center' :
                        'justify-start'
                  )}>
                    {col.label}
                    {col.sortable && (
                      <span className="text-zinc-muted/50 group-hover:text-brand transition-colors">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}

              {/* Actions Column */}
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
                        "group transition-colors overflow-visible border-b border-white/[0.02] last:border-0",
                        onRowClick ? "cursor-pointer" : "",
                        isSelected ? "bg-brand/[0.03]" : "hover:bg-white/[0.02]",
                        isExpanded && "bg-white/[0.02]"
                      )}
                      onClick={() => onRowClick?.(row)}
                      onContextMenu={(e) => {
                        if (rowActions) {
                          e.preventDefault();
                          const target = e.target as HTMLElement;
                          const selectedValue = target.innerText || target.textContent || undefined;
                          setContextMenu({
                            x: e.clientX,
                            y: e.clientY,
                            rowId: id,
                            selectedValue
                          });
                        }
                      }}
                    >
                      {/* Checkbox */}
                      {selectable && (
                        <td className="px-6 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleSelectRow(id)}
                            className={cn(
                              "transition-colors",
                              isSelected ? "text-brand" : "text-zinc-muted hover:text-zinc-text"
                            )}
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>
                        </td>
                      )}

                      {/* Expand Toggle */}
                      {expandable && (
                        <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleExpand(id)}
                            className={cn(
                              "p-1 rounded-sm text-zinc-muted hover:text-brand hover:bg-white/5 transition-all",
                              isExpanded && "rotate-90 text-brand"
                            )}
                          >
                            <ChevronRight className="w-4 h-4 transition-transform" />
                          </button>
                        </td>
                      )}

                      {/* Data Cells */}
                      {columns.map((col) => (
                        <td
                          key={`${id}-${col.key}`}
                          className={cn(
                            "px-6 py-4 text-sm font-bold text-zinc-text",
                            col.align === 'right' ? 'text-end' :
                              col.align === 'center' ? 'text-center' :
                                'text-start',
                            col.className
                          )}
                        >
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      ))}

                      {/* Row Actions */}
                      {rowActions && (
                        <td className="px-4 py-3 text-right overflow-visible" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionId(openActionId === id ? null : id);
                              }}
                              className={cn(
                                "p-2 rounded-sm transition-all",
                                openActionId === id
                                  ? "bg-white/10 text-zinc-text"
                                  : "text-zinc-muted hover:text-zinc-text hover:bg-white/5"
                              )}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openActionId === id && (
                              <div className={cn(
                                "absolute top-0 w-40 bg-obsidian-card border border-white/10 rounded-sm shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100",
                                dir === 'rtl' ? "left-8 origin-top-left" : "right-8 origin-top-right"
                              )}>
                                {rowActions.map((action, i) => (
                                  <button
                                    key={i}
                                    onClick={() => {
                                      action.onClick(row);
                                      setOpenActionId(null);
                                    }}
                                    className={cn(
                                      "w-full text-start px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group/item transition-colors",
                                      action.variant === 'danger'
                                        ? "text-danger hover:bg-danger/10"
                                        : "text-zinc-text hover:bg-white/5"
                                    )}
                                  >
                                    {action.icon && <action.icon className="w-3.5 h-3.5 opacity-70 group-hover/item:opacity-100" />}
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>

                    {/* Expanded Content */}
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
              // Empty State
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (rowActions ? 1 : 0)}
                  className="px-6 py-20 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-zinc-muted opacity-50">
                    <Search className="w-12 h-12 mb-3 stroke-1" />
                    <p className="text-xs uppercase tracking-widest font-bold">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && paginatedData.length > 0 && (
        <div className="px-6 py-6 border-t border-white/5 bg-obsidian-outer/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs font-black text-zinc-muted uppercase tracking-[0.2em]">
            {t('common.showing') || 'Showing'} {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sortedData.length)} {t('common.of') || 'of'} {sortedData.length}
          </p>
          <div className="flex gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-6 py-2.5 bg-obsidian-card border border-white/5 rounded-xl text-xs font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand/30 transition-all flex items-center gap-2 shadow-sm"
            >
              {dir === 'rtl' ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              {t('common.previous') || 'Prev'}
            </button>

            <div className="flex items-center gap-1.5 px-3">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let p = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  p = currentPage - 2 + i;
                }
                if (p > totalPages) return null;

                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-black tracking-widest transition-all",
                      currentPage === p ? "bg-brand text-obsidian-outer shadow-lg shadow-brand/10 scale-110" : "text-zinc-muted hover:bg-white/5"
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-6 py-2.5 bg-obsidian-card border border-white/5 rounded-xl text-xs font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand/30 transition-all flex items-center gap-2 shadow-sm"
            >
              {t('common.next') || 'Next'}
              {dir === 'rtl' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}
      {/* Bulk Actions Floating Bar */}
      {selectedIds.size > 0 && bulkActions && bulkActions.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-obsidian-card border border-white/10 rounded-full shadow-2xl py-2 px-6 flex items-center gap-6 backdrop-blur-xl">
            <div className={cn(
              "flex items-center gap-3 text-[10px] font-black text-zinc-text uppercase tracking-widest whitespace-nowrap",
              dir === 'rtl' ? "pl-6 border-l border-white/10" : "pr-6 border-r border-white/10"
            )}>
              <span className="flex items-center justify-center min-w-[1.5rem] h-6 rounded-full bg-brand text-slate-900 text-[10px] px-1.5 font-black">
                {selectedIds.size}
              </span>
              <span className="hidden sm:inline">
                {selectedIds.size === 1 ? (t('common.selected') || 'Selected') : (t('common.items_selected')?.replace('{count}', String(selectedIds.size)) || `${selectedIds.size} Items Selected`)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {bulkActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const selectedRows = data.filter(row => selectedIds.has(String(row[keyField as keyof T])));
                    action.onClick(Array.from(selectedIds), selectedRows);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 whitespace-nowrap",
                    action.variant === 'danger'
                      ? "bg-danger/20 text-danger hover:bg-danger/30"
                      : action.variant === 'success'
                        ? "bg-success/20 text-success hover:bg-success/30"
                        : "bg-white/5 text-zinc-text hover:bg-white/10"
                  )}
                >
                  {action.icon && <action.icon className="w-3.5 h-3.5" />}
                  {action.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setSelectedIds(new Set());
                onSelectionChange?.([]);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-muted hover:text-white hover:bg-white/5 transition-all shrink-0"
              title={t('common.clear') || 'Clear'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && rowActions && (
        <div
          className={cn(
            "fixed bg-obsidian-panel/95 border border-white/10 rounded-sm shadow-2xl z-[110] py-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 min-w-[180px]",
            dir === 'rtl' ? "text-right" : "text-left"
          )}
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            transform: dir === 'rtl' ? 'translateX(-100%)' : 'none'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-white/5 mb-1">
            <span className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">
              {t('common.actions') || 'Actions'}
            </span>
          </div>

          {contextMenu.selectedValue && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(contextMenu.selectedValue!);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                  setContextMenu(null);
                }, 1000);
              }}
              className="w-full text-start px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group/item transition-colors text-zinc-text hover:bg-white/5 border-b border-white/5 mb-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 opacity-70 group-hover/item:opacity-100" />}
              {copied ? (t('common.done') || 'Done') : (t('common.copy') || 'Copy')}
            </button>
          )}

          {rowActions.map((action, i) => {
            const row = data.find(r => String(r[keyField as keyof T]) === contextMenu.rowId);
            if (!row) return null;
            return (
              <button
                key={i}
                onClick={() => {
                  action.onClick(row);
                  setContextMenu(null);
                }}
                className={cn(
                  "w-full text-start px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group/item transition-colors",
                  action.variant === 'danger'
                    ? "text-danger hover:bg-danger/10"
                    : "text-zinc-text hover:bg-white/5"
                )}
              >
                {action.icon && <action.icon className="w-3.5 h-3.5 opacity-70 group-hover/item:opacity-100" />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}