import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';
import type { Column, Action } from './DataTable.types';

interface ContextMenuProps<T> {
  contextMenu: { x: number; y: number; rowId: string; selectedValue?: string } | null;
  rows: T[];
  keyField: keyof T;
  rowActions: Action<T>[];
  onAction: (action: Action<T>, row: T) => void;
  onClose: () => void;
}

export function useContextMenu<T extends Record<string, any>>({ rows, keyField }: { rows: T[]; keyField: keyof T }) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; rowId: string; selectedValue?: string } | null>(null);

  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, []);

  return { contextMenu, setContextMenu };
}

export function ContextMenu<T extends Record<string, any>>({
  contextMenu,
  rows,
  keyField,
  rowActions,
  onAction,
  onClose,
}: ContextMenuProps<T>) {
  const { t, dir } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!contextMenu) return null;

  const row = rows.find((r) => String(r[keyField as keyof T]) === contextMenu.rowId);
  if (!row) return null;

  const visibleActions = rowActions.filter((action) => {
    const label = typeof action.label === 'function' ? action.label(row) : action.label;
    return label != null;
  });

  return (
    <div
      className={cn(
        'fixed bg-obsidian-panel/95 border border-white/10 rounded-sm shadow-2xl z-[110] py-1 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 min-w-[180px]',
        dir === 'rtl' ? 'text-right' : 'text-left',
      )}
      style={{
        top: `${contextMenu.y}px`,
        left: `${contextMenu.x}px`,
        transform: dir === 'rtl' ? 'translateX(-100%)' : 'none',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1.5 border-b border-white/5 mb-1">
        <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
          {t('common.actions') || 'Actions'}
        </span>
      </div>

      {contextMenu.selectedValue && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(contextMenu.selectedValue!);
            setCopied(true);
            setTimeout(() => { setCopied(false); onClose(); }, 1000);
          }}
          className="w-full text-start px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group/item transition-colors text-zinc-text hover:bg-white/5 border-b border-white/5 mb-1"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 opacity-70 group-hover/item:opacity-100" />}
          {copied ? (t('common.done') || 'Done') : (t('common.copy') || 'Copy')}
        </button>
      )}

      {visibleActions.map((action, i) => {
        const actionLabel = typeof action.label === 'function' ? action.label(row) : action.label;
        const ActionIcon = action.icon
          ? typeof action.icon === 'function' ? (action.icon as (row: T) => React.ElementType)(row) : action.icon
          : null;
        return (
          <button
            key={i}
            onClick={() => { onAction(action, row); onClose(); }}
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
  );
}
