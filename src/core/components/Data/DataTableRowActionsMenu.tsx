import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import { getOverlayPortalRoot } from '@core/hooks/useOverlayPortal';
import { useFixedPopoverPlacement } from '@core/hooks/useFixedPopoverPlacement';
import type { Action } from '@core/components/Data/DataTable.types';

const MENU_WIDTH = 160;
const ITEM_HEIGHT = 40;

export interface DataTableRowActionsMenuProps<T> {
  row: T;
  rowId: string;
  actions: Action<T>[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dir: 'ltr' | 'rtl';
  inline?: boolean;
  triggerClassName?: string;
  iconClassName?: string;
}

export function DataTableRowActionsMenu<T extends Record<string, unknown>>({
  row,
  rowId: _rowId,
  actions,
  isOpen,
  onOpenChange,
  dir,
  inline = false,
  triggerClassName,
  iconClassName,
}: DataTableRowActionsMenuProps<T>) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isRTL = dir === 'rtl';

  const visibleActions = actions.filter((a) => {
    const label = typeof a.label === 'function' ? a.label(row) : a.label;
    return label != null;
  });

  const estimatedHeight = Math.min(visibleActions.length * ITEM_HEIGHT, 300);

  const { position: popoverPosition, mounted: popoverMounted } = useFixedPopoverPlacement({
    isOpen,
    triggerRef,
    popoverRef: menuRef,
    isRTL,
    estimatedWidth: MENU_WIDTH,
    estimatedHeight,
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen, onOpenChange]);

  if (visibleActions.length === 0) return null;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenChange(!isOpen);
  };

  const menuPortal =
    isOpen &&
    popoverMounted &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          top: popoverPosition?.top ?? 0,
          left: popoverPosition?.left ?? 0,
          width: MENU_WIDTH,
          zIndex: 110,
        }}
        className="bg-obsidian-card border border-white/10 rounded-sm shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {visibleActions.map((action, i) => {
          const actionLabel = typeof action.label === 'function' ? action.label(row) : action.label;
          const ActionIcon = action.icon
            ? typeof action.icon === 'function'
              ? (action.icon as (row: T) => React.ElementType)(row)
              : action.icon
            : null;
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                action.onClick(row);
                onOpenChange(false);
              }}
              className={cn(
                'w-full text-start px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group/item transition-colors',
                action.variant === 'danger'
                  ? 'text-danger hover:bg-danger/10'
                  : 'text-zinc-text hover:bg-white/5',
              )}
            >
              {ActionIcon && (
                <ActionIcon className="w-3.5 h-3.5 opacity-70 group-hover/item:opacity-100" />
              )}
              {actionLabel}
            </button>
          );
        })}
      </div>,
      getOverlayPortalRoot(),
    );

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      onClick={handleToggle}
      className={cn(
        'p-2 rounded-sm transition-all',
        isOpen ? 'bg-white/10 text-zinc-text' : 'text-zinc-muted hover:text-zinc-text hover:bg-white/5',
        triggerClassName,
      )}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      aria-label="Row actions"
    >
      <MoreVertical className={cn('w-4 h-4', iconClassName)} />
    </button>
  );

  if (inline) {
    return (
      <>
        {trigger}
        {menuPortal}
      </>
    );
  }

  return (
    <td className="px-4 py-3 text-end" onClick={(e) => e.stopPropagation()}>
      {trigger}
      {menuPortal}
    </td>
  );
}
