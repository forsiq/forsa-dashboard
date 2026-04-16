import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Columns, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';

// --- Types ---

export interface ColumnOption {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface AmberColumnFilterProps {
  columns: ColumnOption[];
  visibleColumns: Set<string>;
  onToggleColumn: (columnKey: string) => void;
  onResetColumns: () => void;
  className?: string;
  align?: 'start' | 'end';
  size?: 'sm' | 'md' | 'lg';
}

// --- Column Filter Component ---

/**
 * AmberColumnFilter - Dropdown for toggling table column visibility
 *
 * @example
 * const [visibleColumns, setVisibleColumns] = useState(new Set(['name', 'email', 'status']));
 *
 * <AmberColumnFilter
 *   columns={[
 *     { key: 'name', label: 'Name' },
 *     { key: 'email', label: 'Email' },
 *     { key: 'status', label: 'Status' }
 *   ]}
 *   visibleColumns={visibleColumns}
 *   onToggleColumn={(key) => {
 *     const newSet = new Set(visibleColumns);
 *     if (newSet.has(key)) newSet.delete(key);
 *     else newSet.add(key);
 *     setVisibleColumns(newSet);
 *   }}
 *   onResetColumns={() => setVisibleColumns(new Set(['name', 'email', 'status']))}
 * />
 */
export function AmberColumnFilter({
  columns,
  visibleColumns,
  onToggleColumn,
  onResetColumns,
  className,
  align = 'end',
  size = 'md',
}: AmberColumnFilterProps) {
  const { t, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  // Calculate visible count
  const visibleCount = columns.filter(col => visibleColumns.has(col.key)).length;

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-white/10',
          'bg-obsidian-card text-zinc-text',
          'hover:bg-white/5 hover:border-white/20',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-brand/50',
          sizeClasses[size]
        )}
      >
        <Columns className="w-4 h-4" />
        <span>{t('common.columns') || 'Columns'}</span>
        <span className="text-zinc-muted">({visibleCount})</span>
        <ChevronDown className={cn(
          'w-4 h-4 text-zinc-muted transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 w-56 bg-obsidian-panel border border-white/10',
            'rounded-lg shadow-xl py-2 animate-in fade-in zoom-in-95 duration-100',
            align === 'end' && (dir === 'rtl' ? 'right-0' : 'left-0'),
            align === 'start' && (dir === 'rtl' ? 'left-0' : 'right-0')
          )}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-white/5">
            <p className="text-xs font-black text-zinc-muted uppercase tracking-widest">
              {t('common.toggle_columns') || 'Toggle Columns'}
            </p>
          </div>

          {/* Column List */}
          <div className="max-h-64 overflow-y-auto py-2">
            {columns.map((column) => {
              const isVisible = visibleColumns.has(column.key);
              return (
                <label
                  key={column.key}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2',
                    'cursor-pointer hover:bg-white/5',
                    'transition-colors',
                    column.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {/* Checkbox */}
                  <div className={cn(
                    'relative flex items-center justify-center',
                    'w-4 h-4 rounded border transition-colors',
                    isVisible
                      ? 'bg-brand border-brand text-obsidian-outer'
                      : 'border-white/20 bg-transparent hover:border-white/40'
                  )}>
                    {isVisible && <Check className="w-3 h-3" />}
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isVisible}
                      disabled={column.disabled}
                      onChange={() => !column.disabled && onToggleColumn(column.key)}
                    />
                  </div>

                  {/* Label */}
                  <span className={cn(
                    'text-sm font-medium flex-1',
                    isVisible ? 'text-zinc-text' : 'text-zinc-muted'
                  )}>
                    {column.label}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Footer with Reset */}
          <div className="px-3 py-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                onResetColumns();
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'text-xs font-bold uppercase tracking-widest',
                'text-zinc-muted hover:text-zinc-text',
                'hover:bg-white/5 rounded-lg py-2',
                'transition-colors'
              )}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t('common.reset_columns') || 'Reset Columns'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Hook for column filtering ---

export interface UseColumnFilterOptions {
  columns: ColumnOption[];
  defaultVisible?: string[] | 'all';
}

export interface UseColumnFilterReturn {
  visibleColumns: Set<string>;
  toggleColumn: (key: string) => void;
  resetColumns: () => void;
  isColumnVisible: (key: string) => boolean;
  ColumnFilter: React.ComponentType<Omit<AmberColumnFilterProps, 'columns' | 'visibleColumns' | 'onToggleColumn' | 'onResetColumns'>>;
}

/**
 * useColumnFilter - Hook for managing column visibility
 *
 * @example
 * function MyTable() {
 *   const { visibleColumns, ColumnFilter } = useColumnFilter({
 *     columns: [
 *       { key: 'name', label: 'Name' },
 *       { key: 'email', label: 'Email' },
 *       { key: 'status', label: 'Status' }
 *     ],
 *     defaultVisible: 'all'
 *   });
 *
 *   return (
 *     <>
 *       <ColumnFilter />
 *       <DataTable
 *         columns={columns.filter(c => visibleColumns.has(c.key))}
 *       />
 *     </>
 *   );
 * }
 */
export function useColumnFilter({
  columns,
  defaultVisible = 'all',
}: UseColumnFilterOptions): UseColumnFilterReturn {
  const getDefaultVisible = (): Set<string> => {
    if (defaultVisible === 'all') {
      return new Set(columns.map(c => c.key));
    }
    return new Set(defaultVisible);
  };

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(getDefaultVisible);

  const toggleColumn = (key: string) => {
    const newSet = new Set(visibleColumns);
    if (newSet.has(key)) {
      // Don't allow hiding the last column
      if (newSet.size > 1) {
        newSet.delete(key);
      }
    } else {
      newSet.add(key);
    }
    setVisibleColumns(newSet);
  };

  const resetColumns = () => {
    setVisibleColumns(getDefaultVisible());
  };

  const isColumnVisible = (key: string): boolean => {
    return visibleColumns.has(key);
  };

  const ColumnFilterComponent: React.ComponentType<Omit<AmberColumnFilterProps, 'columns' | 'visibleColumns' | 'onToggleColumn' | 'onResetColumns'>> = (props) => (
    <AmberColumnFilter
      columns={columns}
      visibleColumns={visibleColumns}
      onToggleColumn={toggleColumn}
      onResetColumns={resetColumns}
      {...props}
    />
  );

  return {
    visibleColumns,
    toggleColumn,
    resetColumns,
    isColumnVisible,
    ColumnFilter: ColumnFilterComponent,
  };
}

export default AmberColumnFilter;
