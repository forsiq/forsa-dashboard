export const TREE_GUIDE_WIDTH = 22;

interface CategoryTreeGuidesProps {
  level: number;
  isLastSibling: boolean;
  ancestorContinues: boolean[];
}

/** Vertical/horizontal connectors for nested category rows (file-tree style). */
export function CategoryTreeGuides({
  level,
  isLastSibling,
  ancestorContinues,
}: CategoryTreeGuidesProps) {
  if (level === 0) return null;

  return (
    <div className="flex items-stretch shrink-0 self-stretch min-h-8" aria-hidden>
      {ancestorContinues.map((showVertical, depth) => (
        <div
          key={`tree-pipe-${depth}`}
          className="relative shrink-0"
          style={{ width: TREE_GUIDE_WIDTH }}
        >
          {showVertical && (
            <span className="pointer-events-none absolute inset-y-0 start-2 w-px bg-white/15" />
          )}
        </div>
      ))}
      <div className="relative shrink-0" style={{ width: TREE_GUIDE_WIDTH }}>
        <span className="pointer-events-none absolute top-0 start-2 h-1/2 w-px bg-white/20" />
        <span className="pointer-events-none absolute top-1/2 start-2 end-0 h-px -translate-y-px bg-white/20" />
        {!isLastSibling && (
          <span className="pointer-events-none absolute bottom-0 top-1/2 start-2 w-px bg-white/20" />
        )}
        <span className="pointer-events-none absolute top-1/2 start-1.5 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-brand/50 ring-2 ring-brand/10" />
      </div>
    </div>
  );
}
