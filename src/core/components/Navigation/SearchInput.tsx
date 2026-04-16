
import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  loading?: boolean;
  onClear?: () => void;
  fullWidth?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  loading = false,
  onClear,
  fullWidth = false,
  className,
  autoFocus
}) => {
  const [inputValue, setInputValue] = useState(value);

  // Sync internal state if parent value changes externally
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs]); // Intentionally excluding onChange/value to avoid loops/resets on prop recreation

  const handleClear = () => {
    setInputValue('');
    onChange(''); // Immediate clear
    onClear?.();
  };

  return (
    <div className={cn("relative group", fullWidth ? "w-full" : "w-64", className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search className="w-4 h-4 text-zinc-muted group-focus-within:text-brand transition-colors" />
      </div>
      
      <input 
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-10 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/50",
          "hover:border-white/10"
        )}
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 text-brand animate-spin" />
        ) : inputValue ? (
          <button 
            onClick={handleClear}
            className="text-zinc-muted hover:text-zinc-text transition-colors p-0.5 rounded-sm hover:bg-white/10"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
};
