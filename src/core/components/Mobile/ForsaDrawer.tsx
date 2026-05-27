'use client';

import React, { useLayoutEffect, useState } from 'react';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import { getOverlayPortalRoot } from '@core/hooks/useOverlayPortal';

export interface ForsaDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  dir?: 'ltr' | 'rtl';
  showClose?: boolean;
  contentClassName?: string;
  bodyClassName?: string;
}

/**
 * Forsa-styled bottom drawer powered by vaul (swipe-to-dismiss, snap, overlay).
 * Renders into #forsa-overlay-portal-root to avoid portal races on document.body.
 */
export function ForsaDrawer({
  open,
  onClose,
  title,
  children,
  dir = 'ltr',
  showClose = false,
  contentClassName,
  bodyClassName,
}: ForsaDrawerProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    setPortalContainer(getOverlayPortalRoot());
  }, []);

  if (!portalContainer) return null;

  const isRTL = dir === 'rtl';

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      dismissible
      shouldScaleBackground={false}
      setBackgroundColorOnScale={false}
      direction="bottom"
    >
      <Drawer.Portal container={portalContainer}>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-[100] mx-auto flex w-full max-w-lg flex-col rounded-t-2xl border-t border-white/10 bg-obsidian-card outline-none',
            'max-h-[85vh]',
            contentClassName,
          )}
          dir={dir}
          aria-describedby={undefined}
        >
          <Drawer.Handle className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-white/20" />

          {showClose && (
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'absolute top-3 p-2 rounded-lg text-zinc-muted hover:text-zinc-text hover:bg-white/10 transition-colors',
                isRTL ? 'left-3' : 'right-3',
              )}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {title && (
            <div className="px-6 pt-2 pb-3 shrink-0">
              <Drawer.Title className="text-base font-black text-zinc-text uppercase tracking-tight">
                {title}
              </Drawer.Title>
            </div>
          )}

          <div
            className={cn(
              'flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pb-8',
              !title && 'pt-2',
              bodyClassName,
            )}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
