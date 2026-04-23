import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';
import type { BulkAction } from './DataTable.types';

interface BulkActionBarProps<T> {
  selectedCount: number;
  bulkActions: BulkAction<T>[];
  selectedIds: Set<string>;
  onClear: () => void;
  onAction: (action: BulkAction<T>) => void;
}

export function BulkActionBar<T extends Record<string, any>>({
  selectedCount,
  bulkActions,
  onClear,
  onAction,
}: BulkActionBarProps<T>) {
  const { t, dir } = useLanguage();

  if (selectedCount === 0 || bulkActions.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-obsidian-card border border-white/10 rounded-full shadow-2xl py-2 px-6 flex items-center gap-6 backdrop-blur-xl">
        <div
          className={cn(
            'flex items-center gap-3 text-[10px] font-black text-zinc-text uppercase tracking-widest whitespace-nowrap',
            dir === 'rtl' ? 'pl-6 border-l border-white/10' : 'pr-6 border-r border-white/10',
          )}
        >
          <span className="flex items-center justify-center min-w-[1.5rem] h-6 rounded-full bg-brand text-slate-900 text-[10px] px-1.5 font-black">
            {selectedCount}
          </span>
          <span className="hidden sm:inline">
            {selectedCount === 1
              ? (t('common.selected') || 'Selected')
              : (t('common.items_selected')?.replace('{count}', String(selectedCount)) || `${selectedCount} Items Selected`)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {bulkActions.map((action, i) => (
            <button
              key={i}
              onClick={() => onAction(action)}
              className={cn(
                'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all hover:scale-105 active:scale-95 whitespace-nowrap',
                action.variant === 'danger'
                  ? 'bg-danger/20 text-danger hover:bg-danger/30'
                  : action.variant === 'success'
                    ? 'bg-success/20 text-success hover:bg-success/30'
                    : 'bg-white/5 text-zinc-text hover:bg-white/10',
              )}
            >
              {action.icon && <action.icon className="w-3.5 h-3.5" />}
              {action.label}
            </button>
          ))}
        </div>

        <button
          onClick={onClear}
          className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-muted hover:text-white hover:bg-white/5 transition-all shrink-0"
          title={t('common.clear') || 'Clear'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
