
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils/cn';
import { useLanguage } from '../contexts/LanguageContext';

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export const AmberDropdown: React.FC<DropdownProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  className,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { dir } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full space-y-1.5", className)} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-[0.15em] px-1 transition-colors text-zinc-muted/90 dark:text-zinc-muted/80">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 bg-obsidian-card border border-white/[0.06] rounded-xl h-14 outline-none transition-all duration-200",
          "text-sm font-bold text-zinc-text hover:border-brand/25 shadow-sm",
          isOpen 
            ? "border-brand/40 bg-obsidian-hover ring-2 ring-brand/10 shadow-[0_0_20px_rgba(245,196,81,0.08)]" 
            : "hover:bg-white/[0.03]"
        )}
      >
        <span className={cn("truncate", selectedOption ? "opacity-90" : "opacity-40")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 transition-all duration-300", 
          isOpen ? "rotate-180 text-brand" : "text-zinc-muted/60"
        )} />
      </button>

      {isOpen && (
        <div 
          className={cn(
            "absolute z-50 mt-1.5 w-full bg-obsidian-card border border-white/[0.08] rounded-xl shadow-2xl py-1 overflow-hidden animate-in fade-in slide-in-from-top-1.5 duration-200 ring-1 ring-white/[0.03]",
            dir === 'rtl' ? 'right-0' : 'left-0'
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-start transition-all duration-150 outline-none",
                value === option.value 
                  ? "bg-brand/10 text-brand border-l-2 border-brand" 
                  : "text-zinc-muted hover:bg-white/[0.04] hover:text-zinc-text"
              )}
            >
              <span className="truncate">{option.label}</span>
              {value === option.value && <Check className="w-4 h-4 shrink-0 text-brand" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
