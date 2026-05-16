import React from 'react';
import { AmberButton } from '@core/components/AmberButton';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="!p-24 text-center space-y-6 bg-obsidian-card/40">
      <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto border border-white/[0.05]">
        <Icon className="w-10 h-10 text-zinc-muted/30" />
      </div>
      <div className="max-w-md mx-auto space-y-2">
        <h3 className="text-xl font-black text-zinc-text uppercase tracking-widest">{title}</h3>
        {description && (
          <p className="text-sm text-zinc-muted font-bold tracking-tight">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <AmberButton onClick={onAction} className="h-11 px-8 rounded-xl bg-brand text-black font-black uppercase active:scale-95 transition-all">
          {actionLabel}
        </AmberButton>
      )}
    </div>
  );
}
