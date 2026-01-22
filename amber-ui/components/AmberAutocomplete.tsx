
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import { cn } from '../../lib/cn';

interface Option {
  label: string;
  value: string;
  subtext?: string;
}

interface AutocompleteProps {
  label?: string;
  placeholder?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const AmberAutocomplete: React.FC<AutocompleteProps> = ({
  label,
  placeholder = "Select...",
  options,
  value,
  onChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.subtext && opt.subtext.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 px-1">
          {label}
        </label>
      )}
      
      <div 
        className={cn(
          "w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm flex items-center px-3 cursor-pointer transition-all",
          isOpen ? "border-brand/30 ring-1 ring-brand/10" : "hover:border-white/20"
        )}
        onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm('');
        }}
      >
        <div className="flex-1 truncate text-xs font-bold text-zinc-text">
          {selectedOption ? selectedOption.label : <span className="text-zinc-muted font-normal italic">{placeholder}</span>}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-muted" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-obsidian-card border border-white/10 rounded-sm shadow-xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
           <div className="p-2 border-b border-white/5">
             <div className="flex items-center gap-2 px-2 py-1.5 bg-obsidian-outer rounded-sm">
                <Search className="w-3 h-3 text-zinc-muted" />
                <input 
                  autoFocus
                  type="text"
                  className="bg-transparent border-none outline-none text-[10px] font-bold text-zinc-text w-full placeholder-zinc-muted/50"
                  placeholder="Filter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
             </div>
           </div>
           <div className="max-h-60 overflow-y-auto p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-left rounded-sm transition-colors group outline-none",
                      value === opt.value ? "bg-brand/10" : "hover:bg-white/5"
                    )}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                  >
                    <div>
                      <div className={cn(
                        "text-[10px] font-black uppercase tracking-wide",
                        value === opt.value ? "text-brand" : "text-zinc-secondary group-hover:text-zinc-text"
                      )}>{opt.label}</div>
                      {opt.subtext && <div className="text-[9px] font-medium text-zinc-muted">{opt.subtext}</div>}
                    </div>
                    {value === opt.value && <Check className="w-3 h-3 text-brand" />}
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-[10px] text-zinc-muted italic">No matches found.</div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
