
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
          "w-full flex items-center justify-between gap-2 px-4 bg-white/5 border border-white/5 rounded-xl h-14 outline-none transition-all",
          "text-base font-medium text-zinc-text hover:border-brand/20 shadow-sm",
          isOpen ? "border-brand/30 bg-obsidian-hover ring-1 ring-brand/5" : "bg-white/5"
        )}
      >
        <span className="truncate opacity-90">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-5 h-5 transition-transform duration-300 opacity-40", isOpen && "rotate-180 opacity-100 text-brand")} />
      </button>

      {isOpen && (
        <div 
          className={cn(
            "absolute z-50 mt-2 w-full bg-[#1A1E26] border border-white/10 rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)] py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 ring-1 ring-white/5",
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
                "w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-start transition-colors outline-none",
                value === option.value 
                  ? "bg-brand/10 text-brand" 
                  : "text-zinc-secondary hover:bg-white/5 hover:text-zinc-text"
              )}
            >
              <span className="truncate">{option.label}</span>
              {value === option.value && <Check className="w-4 h-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
