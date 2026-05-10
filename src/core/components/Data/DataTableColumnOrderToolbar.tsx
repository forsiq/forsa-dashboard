import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import type { Column } from '@core/components/Data/DataTable';

export type ColumnOrderToolbarLabels = {
  title: string;
  selectColumn: string;
  moveUp: string;
  moveDown: string;
};

type Props = {
  columns: Column<any>[];
  selectedKey: string;
  onSelectKey: (key: string) => void;
  onMove: (delta: -1 | 1) => void;
  labels: ColumnOrderToolbarLabels;
  disabled?: boolean;
  dir?: 'ltr' | 'rtl';
};

/**
 * Accessible column reorder: pick column, move up/down (order persisted by parent hook).
 */
export function DataTableColumnOrderToolbar({
  columns,
  selectedKey,
  onSelectKey,
  onMove,
  labels,
  disabled,
  dir = 'ltr',
}: Props) {
  const selectId = 'datatable-column-order-select';

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-obsidian-outer/40"
      role="region"
      aria-label={labels.title}
      dir={dir}
    >
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-muted whitespace-nowrap">
        {labels.title}
      </span>
      <label className="sr-only" htmlFor={selectId}>
        {labels.selectColumn}
      </label>
      <select
        id={selectId}
        className={cn(
          'h-9 min-w-[8rem] max-w-[14rem] rounded-lg border border-white/10 bg-obsidian-card px-2 text-xs font-bold text-zinc-text',
          'focus:outline-none focus:ring-2 focus:ring-brand/30',
        )}
        value={selectedKey}
        onChange={(e) => onSelectKey(e.target.value)}
        disabled={disabled || columns.length === 0}
      >
        {columns.map((c) => (
          <option key={c.key} value={c.key}>
            {typeof c.label === 'string' ? c.label : c.key}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-obsidian-card',
            'text-zinc-text hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none',
          )}
          onClick={() => onMove(-1)}
          disabled={disabled || !selectedKey}
          aria-label={labels.moveUp}
        >
          <ChevronUp className="w-4 h-4" aria-hidden />
        </button>
        <button
          type="button"
          className={cn(
            'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-obsidian-card',
            'text-zinc-text hover:bg-white/5 disabled:opacity-40 disabled:pointer-events-none',
          )}
          onClick={() => onMove(1)}
          disabled={disabled || !selectedKey}
          aria-label={labels.moveDown}
        >
          <ChevronDown className="w-4 h-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
