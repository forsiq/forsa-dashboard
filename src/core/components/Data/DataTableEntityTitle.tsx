import { cn } from '@core/lib/utils/cn';

export type DataTableEntityTitleProps = {
  text: string;
  className?: string;
};

/**
 * Entity title inside DataTable cells: two-line clamp, ellipsis overflow, stable row height.
 * Omits `uppercase` so Arabic and mixed-script titles render correctly.
 */
export function DataTableEntityTitle({ text, className }: DataTableEntityTitleProps) {
  return (
    <p
      className={cn(
        'min-w-0 text-sm font-black text-zinc-text tracking-tight line-clamp-2 break-words',
        className,
      )}
      title={text}
    >
      {text}
    </p>
  );
}
