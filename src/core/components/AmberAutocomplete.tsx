import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@core/lib/utils/cn';

interface AmberAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  label?: string;
  className?: string;
  dir?: 'rtl' | 'ltr';
  error?: string;
  emptyHint?: string;
}

export const AmberAutocomplete: React.FC<AmberAutocompleteProps> = ({
  value,
  onChange,
  suggestions,
  placeholder,
  label,
  className,
  dir,
  error,
  emptyHint,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isRTL = dir === 'rtl';

  const filteredSuggestions = suggestions.filter((s) =>
    s.toLowerCase().includes(value.toLowerCase()),
  );

  // Show dropdown when focused, even with no matching suggestions (shows empty hint)
  const showDropdown = isOpen;

  const handleSelect = useCallback(
    (suggestion: string) => {
      onChange(suggestion);
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.blur();
    },
    [onChange],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1,
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
          handleSelect(filteredSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const highlightMatch = (suggestion: string) => {
    const idx = suggestion.toLowerCase().indexOf(value.toLowerCase());
    if (idx === -1 || !value) return <span className="text-zinc-text">{suggestion}</span>;

    const before = suggestion.slice(0, idx);
    const match = suggestion.slice(idx, idx + value.length);
    const after = suggestion.slice(idx + value.length);

    return (
      <span>
        <span className="text-zinc-text">{before}</span>
        <span className="text-brand font-bold">{match}</span>
        <span className="text-zinc-text">{after}</span>
      </span>
    );
  };

  return (
    <div className={cn('space-y-1.5 w-full', className)} ref={containerRef} dir={dir}>
      {label && (
        <label
          className={cn(
            'text-xs font-bold uppercase tracking-[0.15em] px-1 flex justify-between transition-colors',
            error ? 'text-danger' : 'text-zinc-muted/90 dark:text-zinc-muted/80',
          )}
        >
          <span>{label}</span>
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={cn(
            'w-full bg-white dark:bg-obsidian-card border text-base font-medium text-zinc-text outline-none transition-all placeholder:text-zinc-muted/40 shadow-sm rounded-xl h-14 px-4',
            error
              ? 'border-danger focus:border-danger bg-danger/[0.03]'
              : 'border-zinc-200 dark:border-white/5 focus:border-brand/40 dark:focus:bg-obsidian-hover',
          )}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />

        {showDropdown && (
          <ul
            ref={listRef}
            className={cn(
              'absolute z-50 mt-1 w-full bg-obsidian-card border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto',
              isRTL ? 'right-0' : 'left-0',
            )}
            role="listbox"
          >
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => (
                <li
                  key={suggestion}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  className={cn(
                    'px-4 py-3 cursor-pointer text-sm transition-colors',
                    index === highlightedIndex
                      ? 'bg-white/5 text-zinc-text'
                      : 'text-zinc-text hover:bg-white/5',
                    index === 0 && 'rounded-t-xl',
                    index === filteredSuggestions.length - 1 && 'rounded-b-xl',
                  )}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseLeave={() => setHighlightedIndex(-1)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(suggestion);
                  }}
                >
                  {highlightMatch(suggestion)}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-zinc-muted select-none">
                {emptyHint || 'No suggestions — type to add a new value'}
              </li>
            )}
          </ul>
        )}
      </div>
      {error && (
        <p className="text-[13px] text-danger font-medium px-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
