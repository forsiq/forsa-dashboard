import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';
import { getOverlayPortalRoot } from '@core/hooks/useOverlayPortal';
import { Edit, Trash2, Plus, Power, PowerOff } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';

export interface ContextMenuAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface CategoryRowContextMenuProps {
  x: number;
  y: number;
  actions: ContextMenuAction[];
  onClose: () => void;
}

function CategoryRowContextMenuInner({
  x,
  y,
  actions,
  onClose,
}: CategoryRowContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClick);
    };
  }, [onClose]);

  // Adjust position to keep menu in viewport
  const menuWidth = 220;
  const menuHeight = actions.length * 40 + 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const adjustedX = x + menuWidth > vw ? Math.max(8, vw - menuWidth - 8) : x;
  const adjustedY = y + menuHeight > vh ? Math.max(8, vh - menuHeight - 8) : y;

  return (
    <div
      ref={menuRef}
      role="menu"
      className={cn(
        'fixed z-[300] min-w-[180px] max-w-[260px]',
        'rounded-xl border border-white/10 bg-obsidian-card shadow-2xl',
        'py-1.5 animate-in fade-in zoom-in-95 duration-100',
      )}
      style={{ left: adjustedX, top: adjustedY }}
    >
      {actions.map((action) => (
        <button
          key={action.key}
          role="menuitem"
          disabled={action.disabled}
          onClick={() => {
            action.onClick();
            onClose();
          }}
          className={cn(
            'flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-start',
            action.variant === 'danger'
              ? 'text-danger hover:bg-danger/10'
              : 'text-zinc-text hover:bg-white/[0.04]',
            action.disabled && 'opacity-40 cursor-not-allowed',
          )}
        >
          {action.icon && <span className="shrink-0">{action.icon}</span>}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}

export function CategoryRowContextMenu(props: CategoryRowContextMenuProps) {
  if (typeof document === 'undefined') return null;
  return createPortal(<CategoryRowContextMenuInner {...props} />, getOverlayPortalRoot());
}

/** Hook to manage context menu state for a tree row. */
export function useContextMenu() {
  const router = useRouter();
  const [state, setState] = React.useState<{
    x: number;
    y: number;
    actions: ContextMenuAction[];
  } | null>(null);

  const open = useCallback(
    (e: React.MouseEvent, actions: ContextMenuAction[]) => {
      e.preventDefault();
      e.stopPropagation();
      setState({ x: e.clientX, y: e.clientY, actions });
    },
    [],
  );

  const close = useCallback(() => setState(null), []);

  useEffect(() => {
    if (!state) return;
    const handleRouteChange = () => setState(null);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [state, router.events]);

  return { contextMenu: state, openContextMenu: open, closeContextMenu: close };
}
