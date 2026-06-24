import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { getOverlayPortalRoot } from '@core/hooks/useOverlayPortal';
import { cn } from '@core/lib/utils/cn';

export type DataTableEntityTitleProps = {
  text: string;
  className?: string;
  /** When set, title renders as a navigable link (stops row click propagation). */
  href?: string;
  /** 1 = single-line clamp; 2 = two lines (default); 3 = three lines. */
  maxLines?: 1 | 2 | 3;
};

const baseClassName =
  'min-w-0 text-sm font-black text-zinc-text tracking-tight';

export const dataTableLinkClass =
  'hover:text-brand hover:underline underline-offset-2 decoration-brand/50 transition-colors cursor-pointer';

export const dataTableLinkInGroupClass =
  'group-hover/link:text-brand group-hover/link:underline underline-offset-2 decoration-brand/50 transition-colors';

const linkClassName = `block w-full min-w-0 ${dataTableLinkClass}`;

function FullTitleTooltip({
  text,
  anchorRef,
  open,
  tooltipId,
}: {
  text: string;
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
    const pad = 12;

    let top = rect.bottom + gap;
    if (top + panelRect.height > window.innerHeight - pad) {
      top = Math.max(pad, rect.top - panelRect.height - gap);
    }

    let left = rect.left;
    if (left + panelRect.width > window.innerWidth - pad) {
      left = window.innerWidth - panelRect.width - pad;
    }
    left = Math.max(pad, left);

    setStyle({ top, left, visibility: 'visible' });
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

  if (!open) return null;

  const root = getOverlayPortalRoot();
  if (!root) return null;

  return createPortal(
    <div
      ref={panelRef}
      id={tooltipId}
      role="tooltip"
      className="fixed z-[250] max-w-[min(92vw,420px)] rounded-xl border border-white/10 bg-obsidian-card/95 backdrop-blur-md px-3 py-2.5 shadow-xl pointer-events-none"
      style={style}
    >
      <p className="text-sm font-bold text-zinc-text leading-relaxed break-words whitespace-normal">
        {text}
      </p>
    </div>,
    root,
  );
}

/**
 * Entity title inside DataTable cells: truncated display + full title tooltip when clipped.
 */
const lineClampClass: Record<1 | 2 | 3, string> = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3',
};

export function DataTableEntityTitle({
  text,
  className,
  href,
  maxLines = 2,
}: DataTableEntityTitleProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();
  const [tipOpen, setTipOpen] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  const measureTruncation = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    setIsTruncated(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
  }, []);

  useEffect(() => {
    measureTruncation();
    window.addEventListener('resize', measureTruncation);
    return () => window.removeEventListener('resize', measureTruncation);
  }, [text, maxLines, measureTruncation]);

  const clampClass = cn(
    lineClampClass[maxLines],
    'overflow-hidden break-words [overflow-wrap:anywhere] whitespace-normal text-start',
  );

  const openTip = () => {
    measureTruncation();
    setTipOpen(true);
  };
  const closeTip = () => setTipOpen(false);

  const label = (
    <span
      ref={anchorRef}
      className={cn(baseClassName, clampClass, className)}
      title={isTruncated ? undefined : text}
      aria-describedby={tipOpen && isTruncated ? tooltipId : undefined}
    >
      {text}
    </span>
  );

  const interactiveWrap = (child: React.ReactNode) => (
    <span
      className="block w-full min-w-0 max-w-full overflow-hidden"
      onMouseEnter={openTip}
      onMouseLeave={closeTip}
      onFocus={openTip}
      onBlur={closeTip}
    >
      {child}
      <FullTitleTooltip
        text={text}
        anchorRef={anchorRef}
        open={tipOpen && isTruncated}
        tooltipId={tooltipId}
      />
    </span>
  );

  if (href) {
    return interactiveWrap(
      <Link
        href={href}
        className={linkClassName}
        onClick={(e) => e.stopPropagation()}
      >
        {label}
      </Link>,
    );
  }

  return interactiveWrap(label);
}
