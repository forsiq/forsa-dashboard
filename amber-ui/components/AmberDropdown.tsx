
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/cn';
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
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      {label && (
        <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-1.5 px-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-obsidian-outer border border-white/5 rounded-sm h-[40px] outline-none",
          "text-[10px] font-black uppercase tracking-widest text-zinc-secondary hover:text-zinc-text hover:border-white/20 transition-all",
          isOpen && "border-brand/40 ring-1 ring-brand/10 text-zinc-text bg-[#1A1E26]"
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-s opacity-60", isOpen && "rotate-180 opacity-100 text-brand")} />
      </button>

      {isOpen && (
        <div 
          className={cn(
            "absolute z-50 mt-1.5 w-full bg-obsidian-card border border-white/10 rounded-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-s ring-1 ring-white/5",
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
                "w-full flex items-center justify-between px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-start transition-colors outline-none",
                value === option.value 
                  ? "bg-brand/10 text-brand" 
                  : "text-zinc-muted hover:bg-white/5 hover:text-zinc-text"
              )}
            >
              <span className="truncate">{option.label}</span>
              {value === option.value && <Check className="w-3 h-3 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
