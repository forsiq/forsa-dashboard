import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberInput } from '@core/components/AmberInput';
import { AmberButton } from '@core/components/AmberButton';

interface AmazonSearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const QUICK_SEARCHES_EN = ['Smartphones', 'Laptop', 'Headphones', 'Smart Watch', 'Camera'];
const QUICK_SEARCHES_AR = ['هواتف ذكية', 'لابتوب', 'سماعات', 'ساعة ذكية', 'كاميرا'];

export function AmazonSearchBar({ onSearch, isLoading }: AmazonSearchBarProps) {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');

  const quickSearches = language === 'ar' ? QUICK_SEARCHES_AR : QUICK_SEARCHES_EN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    onSearch(term);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-zinc-muted/50 group-focus-within:text-brand transition-colors" />
          <AmberInput
            placeholder={t('amazon.search_placeholder') || 'Search Amazon products...'}
            className="h-12 bg-obsidian-card border-border text-sm font-bold ps-12 pe-4"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <AmberButton
          type="submit"
          className="h-12 px-8 bg-brand text-black font-black rounded-xl gap-2 border-none active:scale-95 transition-all"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          {t('amazon.search') || 'Search'}
        </AmberButton>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
          {t('amazon.quick_search') || 'Quick Search'}:
        </span>
        {quickSearches.map((term) => (
          <button
            key={term}
            onClick={() => handleQuickSearch(term)}
            disabled={isLoading}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest',
              'border border-white/5 bg-obsidian-panel text-zinc-muted',
              'hover:border-brand/30 hover:text-brand transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
