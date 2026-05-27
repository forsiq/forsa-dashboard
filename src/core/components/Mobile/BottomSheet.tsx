'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { getOverlayPortalRoot, useOverlayPortal } from '@core/hooks/useOverlayPortal';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoint?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  snapPoint,
}) => {
  const { dir } = useLanguage();
  const { shouldRender, isOpen: isSheetOpen } = useOverlayPortal(isOpen, onClose);

  if (!shouldRender) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center" role="dialog" aria-modal="true">
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isSheetOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'relative w-full max-w-lg bg-obsidian-card border-t border-white/10 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out',
          isSheetOpen ? 'translate-y-0' : 'translate-y-full',
        )}
        style={
          isSheetOpen && snapPoint
            ? { transform: `translateY(${snapPoint})` }
            : undefined
        }
        dir={dir}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <button
          onClick={onClose}
          className={cn(
            'absolute top-3 p-2 rounded-lg text-zinc-muted hover:text-zinc-text hover:bg-white/10 transition-colors',
            dir === 'rtl' ? 'left-3' : 'right-3',
          )}
        >
          <X className="w-5 h-5" />
        </button>

        {title && (
          <div className="px-6 pt-2 pb-3">
            <h3 className="text-base font-black text-zinc-text uppercase tracking-tight">
              {title}
            </h3>
          </div>
        )}

        <div className="px-6 pb-8">{children}</div>
      </div>
    </div>,
    getOverlayPortalRoot(),
  );
};
