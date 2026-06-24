'use client';

import React from 'react';
import { X, type LucideIcon } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';

export interface ModalIconHeaderProps {
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  title: React.ReactNode;
  titleId?: string;
  description?: React.ReactNode;
  onClose?: () => void;
  closeDisabled?: boolean;
  closeLabel?: string;
  titleClassName?: string;
}

export function ModalIconHeader({
  icon: Icon,
  iconBg = 'bg-brand/10',
  iconColor = 'text-brand',
  title,
  titleId,
  description,
  onClose,
  closeDisabled,
  closeLabel = 'Close',
  titleClassName,
}: ModalIconHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <div className={cn('mt-0.5 shrink-0 rounded-xl p-2.5', iconBg)}>
        <Icon className={cn('h-6 w-6', iconColor)} />
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3
            id={titleId}
            className={cn(
              'min-w-0 flex-1 text-lg font-bold leading-snug text-zinc-text text-start',
              titleClassName,
            )}
          >
            {title}
          </h3>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              disabled={closeDisabled}
              aria-label={closeLabel}
              className={cn(
                '-mt-1 shrink-0 flex h-9 w-9 items-center justify-center rounded-lg',
                'text-zinc-muted hover:text-zinc-text hover:bg-white/5 active:bg-white/[0.08]',
                'transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian-card',
                'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          ) : null}
        </div>

        {description ? (
          typeof description === 'string' ? (
            <p className="text-sm leading-relaxed text-zinc-muted text-start">{description}</p>
          ) : (
            description
          )
        ) : null}
      </div>
    </div>
  );
}
