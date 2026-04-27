import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { AmberInput } from '@core/components/AmberInput';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';
import type { SearchPropertyDefinition } from '@core/search/definition';

interface UnifiedSearchInputProps {
  value: string;
  onChange: (next: string) => void;
  definitions: SearchPropertyDefinition[];
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
  className?: string;
}

function getLastToken(query: string): string {
  const trimmed = query.trimEnd();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1] || '';
}

export function UnifiedSearchInput({
  value,
  onChange,
  definitions,
  placeholder,
  dir: dirProp,
  className,
}: UnifiedSearchInputProps) {
  const { dir: contextDir } = useLanguage();
  const dir = dirProp || contextDir;
  const [isFocused, setIsFocused] = useState(false);
  const lastToken = getLastToken(value);

  const suggestions = useMemo(() => {
    if (!isFocused) return [];

    if (!lastToken || !lastToken.includes(':')) {
      const keyPrefix = lastToken.toLowerCase();
      return definitions
        .filter((def) => {
          if (!keyPrefix) return true;
          const candidates = [def.key, ...(def.aliases || []), def.displayKey || ''].map((k) => k.toLowerCase());
          return candidates.some((candidate) => candidate.startsWith(keyPrefix));
        })
        .slice(0, 6)
        .map((def) => ({
          type: 'property' as const,
          label: `${def.displayKey || def.key}:`,
          value: `${def.displayKey || def.key}:`,
        }));
    }

    const [rawKey, rawValue = ''] = lastToken.split(':');
    const key = rawKey.toLowerCase();
    const property = definitions.find(
      (def) => def.key.toLowerCase() === key || (def.aliases || []).map((a) => a.toLowerCase()).includes(key),
    );
    if (!property || !property.values?.length) return [];

    const valuePrefix = rawValue.toLowerCase();
    return property.values
      .filter((v) => !valuePrefix || v.toLowerCase().startsWith(valuePrefix))
      .slice(0, 6)
      .map((v) => ({
        type: 'value' as const,
        label: `${rawKey}:${v}`,
        value: `${rawKey}:${v}`,
      }));
  }, [definitions, isFocused, lastToken]);

  const applySuggestion = (suggestionValue: string) => {
    const parts = value.trimEnd().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      onChange(`${suggestionValue} `);
      return;
    }
    parts[parts.length - 1] = suggestionValue;
    onChange(`${parts.join(' ')} `);
  };

  return (
    <div className={cn('relative min-w-0 w-full max-w-xl', className)}>
      <AmberInput
        icon={<Search className="w-4 h-4" />}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        className="bg-[var(--color-obsidian-card)] border-[var(--color-border)] shadow-sm rounded-xl h-11 focus:ring-[var(--color-brand)]/20"
      />
      {isFocused && suggestions.length > 0 && (
        <div
          dir={dir}
          className="absolute z-20 mt-1 w-full rounded-xl border border-white/10 bg-[var(--color-obsidian-card)] shadow-lg overflow-hidden"
        >
          {suggestions.map((item) => (
            <button
              key={`${item.type}-${item.value}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applySuggestion(item.value);
              }}
              className="w-full px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 transition-colors text-start"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default UnifiedSearchInput;
