
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
  GripVertical
} from 'lucide-react';
import { cn } from '../../../lib/cn';

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
  draggable?: boolean; // New prop for DnD
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  onRowReorder?: (sourceIndex: number, destinationIndex: number) => void; // New callback
  rowActions?: Action<T>[];
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
  draggable = false,
  onRowClick,
  onSelectionChange,
  onRowReorder,
  rowActions,
  expandComponent,
  emptyMessage = "No data available",
  className
}: DataTableProps<T>) {
  // --- State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  
  // Drag State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Optional: Set ghost image
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    onRowReorder?.(draggedIndex, dropIndex);
    setDraggedIndex(null);
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
      <div className={cn("w-full h-64 flex flex-col items-center justify-center text-zinc-muted bg-obsidian-panel border border-white/5 rounded-sm", className)}>
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-brand" />
        <p className="text-xs font-bold uppercase tracking-widest">Loading Data...</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col bg-obsidian-panel border border-white/5 rounded-lg shadow-sm overflow-hidden", className)}>
      
      {/* Table Container */}
      <div className="flex-1 overflow-x-auto min-h-[200px]">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-obsidian-outer/50 border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              {/* Drag Handle Column */}
              {draggable && <th className="w-10 px-2"></th>}

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
                    "px-6 py-4 text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em] select-none group",
                    col.width,
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                    col.sortable ? 'cursor-pointer hover:text-zinc-text' : '',
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={cn(
                    "flex items-center gap-2",
                    col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
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
              paginatedData.map((row, index) => {
                const id = String(row[keyField as keyof T]);
                const isSelected = selectedIds.has(id);
                const isExpanded = expandedIds.has(id);

                return (
                  <React.Fragment key={id}>
                    <tr 
                      draggable={draggable}
                      onDragStart={(e) => draggable && handleDragStart(e, index)}
                      onDragOver={(e) => draggable && handleDragOver(e, index)}
                      onDrop={(e) => draggable && handleDrop(e, index)}
                      className={cn(
                        "group transition-colors",
                        onRowClick ? "cursor-pointer" : "",
                        isSelected ? "bg-brand/[0.03]" : "hover:bg-white/[0.02]",
                        isExpanded && "bg-white/[0.02]",
                        draggable && "cursor-move"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {/* Drag Handle */}
                      {draggable && (
                        <td className="px-2 py-3 text-center text-zinc-muted/50 cursor-grab active:cursor-grabbing">
                           <GripVertical className="w-4 h-4 mx-auto" />
                        </td>
                      )}

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
                            "px-6 py-4 text-xs text-zinc-text",
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                            col.className
                          )}
                        >
                          {col.render ? col.render(row) : row[col.key]}
                        </td>
                      ))}

                      {/* Row Actions */}
                      {rowActions && (
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
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
                                  : "text-zinc-muted hover:text-zinc-text hover:bg-white/5 opacity-0 group-hover:opacity-100"
                              )}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openActionId === id && (
                              <div className="absolute right-8 top-0 w-40 bg-obsidian-card border border-white/10 rounded-sm shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                {rowActions.map((action, i) => (
                                  <button
                                    key={i}
                                    onClick={() => {
                                      action.onClick(row);
                                      setOpenActionId(null);
                                    }}
                                    className={cn(
                                      "w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group/item transition-colors",
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
                         <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0) + (draggable ? 1 : 0) + 1} className="px-6 py-4 border-b border-white/5">
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
                  colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (rowActions ? 1 : 0) + (draggable ? 1 : 0)} 
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
        <div className="px-6 py-4 border-t border-white/5 bg-obsidian-outer/30 flex flex-col sm:flex-row items-center justify-between gap-4">
           <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em]">
             Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
           </p>
           <div className="flex gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-4 py-1.5 bg-obsidian-card border border-white/5 rounded-sm text-[10px] font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:border-brand/20 transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-3 h-3" /> Prev
              </button>
              
              <div className="flex items-center gap-1 px-2">
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
                             "w-6 h-6 flex items-center justify-center rounded-sm text-[10px] font-bold transition-all",
                             currentPage === p ? "bg-brand text-obsidian-outer" : "text-zinc-muted hover:bg-white/5"
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
                className="px-4 py-1.5 bg-obsidian-card border border-white/5 rounded-sm text-[10px] font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:border-brand/20 transition-all flex items-center gap-1"
              >
                Next <ChevronRight className="w-3 h-3" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
