import React, { useState, useEffect, useRef } from 'react';
import { 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X, 
  RotateCcw, 
  Calendar, 
  Search, 
  Check,
  Hash
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { AmberButton } from '../AmberButton';
import { AmberInput } from '../AmberInput';
import { AmberDropdown } from '../AmberDropdown';

export type FilterType = 'text' | 'select' | 'multiselect' | 'date-range' | 'number-range' | 'checkbox';

export interface FilterDefinition {
  key: string;
  label: string;
  type: FilterType;
  options?: { label: string; value: string }[];
  placeholder?: string;
  group?: string;
}

interface FilterPanelProps {
  filters: FilterDefinition[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onClear?: () => void;
  collapsible?: boolean;
  applyButton?: boolean;
  className?: string;
}

// --- Internal Helper: MultiSelect ---
const FilterMultiSelect = ({ 
  options = [], 
  value = [], 
  onChange, 
  placeholder = "Select..." 
}: { 
  options: { label: string; value: string }[], 
  value: string[], 
  onChange: (val: string[]) => void, 
  placeholder?: string 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (val: string) => {
    const newValue = value.includes(val) 
      ? value.filter(v => v !== val)
      : [...value, val];
    onChange(newValue);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-obsidian-outer border border-white/5 rounded-sm h-[44px] outline-none transition-all",
          isOpen ? "border-brand/30 ring-1 ring-brand/10" : "hover:border-white/20"
        )}
      >
        <span className={cn("truncate text-xs font-bold", value.length > 0 ? "text-zinc-text" : "text-zinc-muted")}>
          {value.length > 0 ? `${value.length} Selected` : placeholder}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-zinc-muted transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-obsidian-card border border-white/10 rounded-sm shadow-xl max-h-60 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => {
            const isSelected = value.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleOption(opt.value)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-left rounded-sm transition-colors",
                  isSelected ? "bg-brand/10 text-brand" : "text-zinc-muted hover:bg-white/5 hover:text-zinc-text"
                )}
              >
                <div className={cn("w-3 h-3 border rounded-sm flex items-center justify-center transition-colors", isSelected ? "border-brand bg-brand text-black" : "border-white/20")}>
                  {isSelected && <Check className="w-2.5 h-2.5" />}
                </div>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  values,
  onChange,
  onClear,
  collapsible = true,
  applyButton = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(!collapsible);
  const [localValues, setLocalValues] = useState(values);

  // Sync props to state if apply button isn't used or external updates happen
  useEffect(() => {
    setLocalValues(values);
  }, [values]);

  const activeCount = Object.keys(values).filter(k => {
    const v = values[k];
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object' && v !== null) return Object.values(v).some(val => !!val);
    return v !== '' && v !== null && v !== undefined && v !== false;
  }).length;

  const handleChange = (key: string, val: any) => {
    const newValues = { ...localValues, [key]: val };
    setLocalValues(newValues);
    if (!applyButton) {
      onChange(newValues);
    }
  };

  const handleApply = () => {
    onChange(localValues);
  };

  const handleClear = () => {
    const cleared: Record<string, any> = {};
    // Reset values based on type logic if strict typing needed, but simple clear usually works with undefined/empty
    filters.forEach(f => {
      if (f.type === 'multiselect') cleared[f.key] = [];
      else if (f.type === 'date-range' || f.type === 'number-range') cleared[f.key] = { min: '', max: '' };
      else if (f.type === 'checkbox') cleared[f.key] = false;
      else cleared[f.key] = '';
    });
    setLocalValues(cleared);
    onChange(cleared);
    onClear?.();
  };

  // Group filters
  const groupedFilters = React.useMemo(() => {
    const groups: Record<string, FilterDefinition[]> = { 'default': [] };
    filters.forEach(f => {
      const g = f.group || 'default';
      if (!groups[g]) groups[g] = [];
      groups[g].push(f);
    });
    return groups;
  }, [filters]);

  const renderFilterInput = (f: FilterDefinition) => {
    const val = localValues[f.key];

    switch (f.type) {
      case 'text':
        return (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-muted" />
            <input
              type="text"
              className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm pl-9 pr-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/40"
              placeholder={f.placeholder || "Search..."}
              value={val || ''}
              onChange={(e) => handleChange(f.key, e.target.value)}
            />
          </div>
        );
      
      case 'select':
        return (
          <AmberDropdown
            options={f.options || []}
            value={val || ''}
            onChange={(v) => handleChange(f.key, v)}
            placeholder={f.placeholder || "Select..."}
            className="w-full"
          />
        );

      case 'multiselect':
        return (
          <FilterMultiSelect
            options={f.options || []}
            value={val || []}
            onChange={(v) => handleChange(f.key, v)}
            placeholder={f.placeholder}
          />
        );

      case 'date-range':
        return (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="date"
                className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-[10px] font-bold text-zinc-text outline-none focus:border-brand/30 uppercase"
                value={val?.min || ''}
                onChange={(e) => handleChange(f.key, { ...val, min: e.target.value })}
                placeholder="Start"
              />
            </div>
            <div className="relative flex-1">
               <input
                type="date"
                className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-[10px] font-bold text-zinc-text outline-none focus:border-brand/30 uppercase"
                value={val?.max || ''}
                onChange={(e) => handleChange(f.key, { ...val, max: e.target.value })}
                placeholder="End"
              />
            </div>
          </div>
        );

      case 'number-range':
        return (
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-muted text-[10px]">Min</span>
               <input
                type="number"
                className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm pl-9 pr-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30"
                value={val?.min || ''}
                onChange={(e) => handleChange(f.key, { ...val, min: e.target.value })}
              />
            </div>
            <span className="text-zinc-muted">-</span>
            <div className="relative flex-1">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-muted text-[10px]">Max</span>
               <input
                type="number"
                className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm pl-9 pr-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30"
                value={val?.max || ''}
                onChange={(e) => handleChange(f.key, { ...val, max: e.target.value })}
              />
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-3 p-3 bg-obsidian-outer border border-white/5 rounded-sm cursor-pointer hover:border-white/10 transition-all h-11">
            <input 
              type="checkbox" 
              checked={!!val} 
              onChange={(e) => handleChange(f.key, e.target.checked)}
              className="accent-brand w-4 h-4"
            />
            <span className="text-xs font-bold text-zinc-text select-none">{f.placeholder || f.label}</span>
          </label>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("bg-obsidian-panel border border-white/10 rounded-lg shadow-sm overflow-hidden transition-all duration-300", className)}>
      {/* Header */}
      <div 
        className={cn(
          "px-5 py-4 flex items-center justify-between select-none bg-obsidian-panel",
          collapsible ? "cursor-pointer hover:bg-white/[0.01]" : ""
        )}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-1.5 rounded-sm bg-obsidian-outer border border-white/5 text-zinc-muted transition-colors", activeCount > 0 && "text-brand border-brand/20")}>
             <Filter className="w-4 h-4" />
          </div>
          <span className="text-sm font-black text-zinc-text uppercase tracking-widest">Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-brand text-obsidian-outer text-[9px] font-bold rounded-full">{activeCount} Active</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="text-[10px] font-bold text-zinc-muted hover:text-danger flex items-center gap-1 transition-colors uppercase tracking-wider"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          )}
          {collapsible && (
            <div className="text-zinc-muted">
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="p-5 border-t border-white/5 bg-obsidian-outer/20">
          <div className="space-y-6">
            {Object.entries(groupedFilters).map(([group, groupFilters]) => {
               // Fix: Cast unknown groupFilters to FilterDefinition[]
               const filters = groupFilters as FilterDefinition[];

               if (filters.length === 0) return null;
               
               return (
                 <div key={group} className="space-y-3">
                    {group !== 'default' && (
                       <h4 className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] pl-1">{group}</h4>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       {filters.map(f => (
                          <div key={f.key} className="space-y-1.5">
                             {f.type !== 'checkbox' && (
                                <label className="text-[9px] font-bold text-zinc-muted uppercase tracking-widest px-1 block">{f.label}</label>
                             )}
                             {renderFilterInput(f)}
                          </div>
                       ))}
                    </div>
                 </div>
               );
            })}
          </div>
          
          {applyButton && (
             <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                <AmberButton onClick={handleApply} size="sm" className="px-6">Apply Filters</AmberButton>
             </div>
          )}
        </div>
      )}
    </div>
  );
};