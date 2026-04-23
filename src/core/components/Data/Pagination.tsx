import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, pageSize, totalItems, onPageChange }: PaginationProps) {
  const { t, dir } = useLanguage();

  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-6 border-t border-white/5 bg-obsidian-outer/30 flex flex-col sm:flex-row items-center justify-between gap-6">
      <p className="text-xs font-black text-zinc-muted uppercase tracking-[0.2em]">
        {t('common.showing') || 'Showing'} {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} {t('common.of') || 'of'} {totalItems}
      </p>
      <div className="flex gap-3">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="px-6 py-2.5 bg-obsidian-card border border-white/5 rounded-xl text-xs font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand/30 transition-all flex items-center gap-2 shadow-sm"
        >
          {dir === 'rtl' ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          {t('common.previous') || 'Prev'}
        </button>

        <div className="flex items-center gap-1.5 px-3">
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            let p = i + 1;
            if (totalPages > 5 && currentPage > 3) {
              p = currentPage - 2 + i;
            }
            if (p > totalPages) return null;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-black tracking-widest transition-all',
                  currentPage === p ? 'bg-brand text-obsidian-outer shadow-lg shadow-brand/10 scale-110' : 'text-zinc-muted hover:bg-white/5',
                )}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="px-6 py-2.5 bg-obsidian-card border border-white/5 rounded-xl text-xs font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand/30 transition-all flex items-center gap-2 shadow-sm"
        >
          {t('common.next') || 'Next'}
          {dir === 'rtl' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
