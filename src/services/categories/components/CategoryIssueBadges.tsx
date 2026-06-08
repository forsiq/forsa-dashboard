import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import type { CategoryIssue } from '../lib/categoryHealth';

interface CategoryIssueBadgesProps {
  issues: CategoryIssue[];
  t: (key: string) => string;
  compact?: boolean;
  className?: string;
}

function IssueTooltipPanel({
  issues,
  t,
  anchorRef,
  open,
  tooltipId,
}: {
  issues: CategoryIssue[];
  t: (key: string) => string;
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  tooltipId: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: 'hidden' });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;

    const rect = anchor.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const gap = 8;
    const viewportPad = 12;

    let top = rect.bottom + gap;
    if (top + panelRect.height > window.innerHeight - viewportPad) {
      top = Math.max(viewportPad, rect.top - panelRect.height - gap);
    }

    let left = rect.left;
    if (left + panelRect.width > window.innerWidth - viewportPad) {
      left = window.innerWidth - panelRect.width - viewportPad;
    }
    left = Math.max(viewportPad, left);

    setStyle((prev) => {
      const next: React.CSSProperties = {
        top,
        left,
        visibility: 'visible',
      };
      if (
        prev.top === next.top &&
        prev.left === next.left &&
        prev.visibility === next.visibility
      ) {
        return prev;
      }
      return next;
    });
  }, [anchorRef]);

  useEffect(() => {
    if (!open) {
      setStyle({ visibility: 'hidden' });
      return;
    }
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={panelRef}
      id={tooltipId}
      role="tooltip"
      style={style}
      className="fixed z-[250] w-[min(18rem,calc(100vw-1.5rem))] rounded-xl border border-white/10 bg-obsidian-card shadow-xl p-3 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
    >
      <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-2">
        {t('category.health.tab') || 'Issues'}
      </p>
      <ul className="space-y-1.5">
        {issues.map((issue) => (
          <li
            key={issue.type}
            className={cn(
              'flex items-start gap-2 text-xs font-semibold leading-snug',
              issue.severity === 'error' ? 'text-danger' : 'text-warning',
            )}
          >
            {issue.severity === 'error' ? (
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            )}
            <span>{t(issue.labelKey)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 pt-2 border-t border-white/5 text-[10px] text-zinc-muted leading-relaxed">
        {t('category.health.issues_context') ||
          'Review and fix these issues on this category.'}
      </p>
    </div>,
    document.body,
  );
}

export function CategoryIssueBadges({
  issues,
  t,
  compact = false,
  className,
}: CategoryIssueBadgesProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  if (!issues.length) return null;

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const Icon = errorCount > 0 ? AlertCircle : AlertTriangle;

  const showTooltip = () => setOpen(true);
  const hideTooltip = () => setOpen(false);

  if (compact) {
    return (
      <>
        <span
          ref={triggerRef}
          tabIndex={0}
          aria-describedby={open ? tooltipId : undefined}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 cursor-help',
            errorCount > 0
              ? 'bg-danger/15 text-danger border border-danger/25'
              : 'bg-warning/15 text-warning border border-warning/25',
            className,
          )}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          onFocus={showTooltip}
          onBlur={hideTooltip}
        >
          <Icon className="w-3 h-3" aria-hidden />
          <span className="tabular-nums">{issues.length}</span>
        </span>
        <IssueTooltipPanel
          issues={issues}
          t={t}
          anchorRef={triggerRef}
          open={open}
          tooltipId={tooltipId}
        />
      </>
    );
  }

  return (
    <div className={cn('relative inline-flex', className)}>
      <span
        ref={triggerRef}
        tabIndex={0}
        aria-describedby={open ? tooltipId : undefined}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 cursor-help',
          errorCount > 0
            ? 'bg-danger/15 text-danger border border-danger/25'
            : 'bg-warning/15 text-warning border border-warning/25',
        )}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        <Icon className="w-3 h-3" aria-hidden />
        <span className="tabular-nums">{issues.length}</span>
      </span>
      <IssueTooltipPanel
        issues={issues}
        t={t}
        anchorRef={triggerRef}
        open={open}
        tooltipId={tooltipId}
      />
    </div>
  );
}
