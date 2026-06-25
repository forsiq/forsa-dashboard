import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';
import type { CategoryViewMode } from '../lib';

interface CategoryViewToggleProps {
  viewMode: CategoryViewMode;
  onChange: (mode: CategoryViewMode) => void;
  t: (key: string) => string;
}

export function CategoryViewToggle({ viewMode, onChange, t }: CategoryViewToggleProps) {
  return (
    <div
      className="flex items-center bg-[var(--color-obsidian-card)] rounded-xl p-0.5 border border-[var(--color-border)]"
      role="group"
      aria-label={t('category.view_mode') || 'View mode'}
    >
      <button
        type="button"
        onClick={() => onChange('table')}
        className={cn(
          'p-2 rounded-lg transition-all',
          viewMode === 'table'
            ? 'bg-[var(--color-brand)] text-black shadow-sm'
            : 'text-zinc-muted hover:text-zinc-text hover:bg-black/5',
        )}
        title={t('common.table_view') || 'Table View'}
        aria-label={t('common.table_view') || 'Table View'}
        aria-pressed={viewMode === 'table'}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={cn(
          'p-2 rounded-lg transition-all',
          viewMode === 'grid'
            ? 'bg-[var(--color-brand)] text-black shadow-sm'
            : 'text-zinc-muted hover:text-zinc-text hover:bg-black/5',
        )}
        title={t('common.grid_view') || 'Grid View'}
        aria-label={t('common.grid_view') || 'Grid View'}
        aria-pressed={viewMode === 'grid'}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
    </div>
  );
}
