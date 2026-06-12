import Link from 'next/link';
import { cn } from '@core/lib/utils/cn';

export type DataTableEntityTitleProps = {
  text: string;
  className?: string;
  /** When set, title renders as a navigable link (stops row click propagation). */
  href?: string;
};

const baseClassName =
  'min-w-0 text-sm font-black text-zinc-text tracking-tight line-clamp-2 break-words';

export const dataTableLinkClass =
  'hover:text-brand hover:underline underline-offset-2 decoration-brand/50 transition-colors cursor-pointer';

export const dataTableLinkInGroupClass =
  'group-hover/link:text-brand group-hover/link:underline underline-offset-2 decoration-brand/50 transition-colors';

const linkClassName = `block w-full min-w-0 ${dataTableLinkClass}`;

/**
 * Entity title inside DataTable cells: two-line clamp, ellipsis overflow, stable row height.
 */
export function DataTableEntityTitle({ text, className, href }: DataTableEntityTitleProps) {
  if (href) {
    return (
      <Link
        href={href}
        className={cn(baseClassName, linkClassName, className)}
        title={text}
        onClick={(e) => e.stopPropagation()}
      >
        {text}
      </Link>
    );
  }

  return (
    <p className={cn(baseClassName, className)} title={text}>
      {text}
    </p>
  );
}
