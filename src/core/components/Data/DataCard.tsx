import React from 'react';
import { CheckSquare, Square, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import type { Column, Action } from './DataTable.types';

interface DataCardProps<T> {
  row: T;
  id: string;
  keyField: keyof T;
  columns: Column<T>[];
  cardFields: Column<T>[];
  titleCol?: Column<T>;
  subtitleCol?: Column<T>;
  mediaCol?: Column<T>;
  badgeCols: Column<T>[];
  detailCols: Column<T>[];
  rowActions?: Action<T>[];
  isSelected: boolean;
  openActionId: string | null;
  onRowClick?: (row: T) => void;
  onSelectRow: (id: string) => void;
  onToggleAction: (id: string) => void;
}

export function DataCard<T extends Record<string, any>>({
  row,
  id,
  cardFields,
  titleCol,
  subtitleCol,
  mediaCol,
  badgeCols,
  detailCols,
  rowActions,
  isSelected,
  openActionId,
  onRowClick,
  onSelectRow,
  onToggleAction,
}: DataCardProps<T>) {
  const hasMedia = mediaCol && mediaCol.render;
  const visibleActions = rowActions?.filter((a) => {
    const label = typeof a.label === 'function' ? a.label(row) : a.label;
    return label != null;
  });

  return (
    <div
      key={id}
      className={cn(
        'group relative rounded-xl border border-white/5 bg-[var(--color-obsidian-card)] transition-all duration-300 overflow-hidden',
        'hover:border-white/10 hover:shadow-md',
        onRowClick && 'cursor-pointer',
        isSelected && 'ring-1 ring-brand/30 border-brand/20',
      )}
      onClick={() => onRowClick?.(row)}
    >
      {rowActions && (
        <div className="absolute top-3 start-3 z-10" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onSelectRow(id)}
            className={cn(
              'transition-colors',
              isSelected ? 'text-brand' : 'text-zinc-muted hover:text-zinc-text opacity-0 group-hover:opacity-100',
            )}
          >
            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          </button>
        </div>
      )}

      {hasMedia && (
        <div className="relative h-44 bg-obsidian-outer/50 overflow-hidden">
          {mediaCol!.render(row)}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-obsidian-card)] via-transparent to-transparent opacity-80" />
          {badgeCols.length > 0 && (
            <div className="absolute top-3 start-3 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
              {badgeCols.map((col) => (
                <span key={col.key}>
                  {col.render ? col.render(row) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/40 backdrop-blur-sm text-zinc-text border border-white/10">
                      {row[col.key]}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={cn('p-4', hasMedia && 'pt-3')}>
        {(titleCol || rowActions) && (
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              {titleCol && (
                <h3 className="text-sm font-bold text-zinc-text truncate">
                  {titleCol.render ? titleCol.render(row) : row[titleCol.key]}
                </h3>
              )}
              {subtitleCol && (
                <p className="text-xs text-zinc-muted mt-0.5 truncate">
                  {subtitleCol.render ? subtitleCol.render(row) : row[subtitleCol.key]}
                </p>
              )}
            </div>

            {rowActions && (
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                {visibleActions?.slice(0, 3).map((action, i) => {
                  const ResolvedIcon = action.icon
                    ? typeof action.icon === 'function' ? (action.icon as (row: T) => React.ElementType)(row) : action.icon
                    : null;
                  return (
                    <button
                      key={i}
                      onClick={() => action.onClick(row)}
                      className={cn(
                        'p-1.5 rounded-lg transition-all',
                        action.variant === 'danger'
                          ? 'text-danger/60 hover:text-danger hover:bg-danger/10'
                          : 'text-zinc-muted hover:text-zinc-text hover:bg-white/5',
                      )}
                      title={typeof action.label === 'function' ? action.label(row) : action.label}
                    >
                      {ResolvedIcon && <ResolvedIcon className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
                {(visibleActions?.length ?? 0) > 3 && (
                  <button
                    onClick={() => onToggleAction(openActionId === id ? '' : id)}
                    className="p-1.5 rounded-lg text-zinc-muted hover:text-zinc-text hover:bg-white/5 transition-all"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {!hasMedia && badgeCols.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {badgeCols.map((col) => (
              <span key={col.key}>
                {col.render ? col.render(row) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/5 text-zinc-muted border border-white/5">
                    {row[col.key]}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        {detailCols.length > 0 && (
          <div className="space-y-2 mt-3 pt-3 border-t border-white/5">
            {detailCols.map((col) => {
              const label = typeof col.label === 'string' ? col.label : col.key;
              return (
                <div key={col.key} className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-muted shrink-0">{label}</span>
                  <span className="text-xs font-semibold text-zinc-text text-end truncate">
                    {col.render ? col.render(row) : row[col.key]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {rowActions && (visibleActions?.length ?? 0) > 3 && openActionId === id && (
        <div
          className="absolute top-12 end-3 w-40 bg-obsidian-card border border-white/10 rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {visibleActions?.slice(3).map((action, i) => {
            const actionLabel = typeof action.label === 'function' ? action.label(row) : action.label;
            const ResolvedIcon = action.icon
              ? typeof action.icon === 'function' ? (action.icon as (row: T) => React.ElementType)(row) : action.icon
              : null;
            return (
              <button
                key={i}
                onClick={() => { action.onClick(row); onToggleAction(''); }}
                className={cn(
                  'w-full text-start px-3 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group/item transition-colors',
                  action.variant === 'danger' ? 'text-danger hover:bg-danger/10' : 'text-zinc-text hover:bg-white/5',
                )}
              >
                {ResolvedIcon && <ResolvedIcon className="w-3.5 h-3.5 opacity-70 group-hover/item:opacity-100" />}
                {actionLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
