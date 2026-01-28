
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, History, ArrowRight, CornerDownLeft, Command } from 'lucide-react';
import { useLanguage } from '../amber-ui/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/cn';
import { performGlobalSearch, SearchResult } from '../utils/globalSearch';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Record<string, SearchResult[]>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus management and body scroll lock
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery(''); // Reset on close
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // If already open, do nothing (or close). If closed, parent handles open.
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Perform search on query change
  useEffect(() => {
    const hits = performGlobalSearch(query);
    setResults(hits);
  }, [query]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const hasResults = Object.keys(results).length > 0;

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl bg-obsidian-panel border border-white/10 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-200 flex flex-col max-h-[70vh]">
        
        {/* Search Input Area */}
        <div className="flex items-center px-4 py-4 border-b border-white/5 bg-obsidian-panel shrink-0 gap-3">
          <Search className="w-5 h-5 text-zinc-muted" />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent border-none outline-none text-zinc-text text-base placeholder-zinc-muted/50 font-medium"
          />
          <div className="hidden sm:flex items-center gap-1">
             <span className="text-[10px] font-bold text-zinc-muted bg-white/5 px-1.5 py-0.5 rounded border border-white/5">ESC</span>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide min-h-[300px]">
          {!query ? (
            <div className="p-4 space-y-6">
              {/* Empty State / Suggestions */}
              <div>
                <h3 className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-3 px-2">Recent & Suggested</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                   {[
                     { label: 'Dashboard', path: '/dashboard', type: 'Page' },
                     { label: 'Create Order', path: '/orders', type: 'Action' },
                     { label: 'Customers', path: '/crm/customers', type: 'Page' },
                     { label: 'Inventory Audit', path: '/inventory/stock-take', type: 'Action' },
                   ].map((item, i) => (
                     <button 
                       key={i} 
                       onClick={() => handleNavigate(item.path)}
                       className="flex items-center gap-3 p-3 rounded-md hover:bg-white/5 text-left group transition-colors border border-transparent hover:border-white/5"
                     >
                        <History className="w-4 h-4 text-zinc-muted group-hover:text-brand" />
                        <span className="text-sm font-medium text-zinc-secondary group-hover:text-zinc-text">{item.label}</span>
                     </button>
                   ))}
                </div>
              </div>
              
              <div className="px-2 pt-4 border-t border-white/5">
                 <p className="text-xs text-zinc-muted italic">
                    Try searching for <span className="text-brand">"Orders"</span>, <span className="text-brand">"Acme Corp"</span>, or <span className="text-brand">"Headphones"</span>.
                 </p>
              </div>
            </div>
          ) : hasResults ? (
            <div className="space-y-4 p-2">
              {Object.entries(results).map(([type, items]) => (
                <div key={type}>
                  <h3 className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] px-3 mb-2 mt-2">{type}</h3>
                  <div className="space-y-1">
                    {(items as SearchResult[]).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.path)}
                        className="w-full flex items-center gap-4 p-3 rounded-md hover:bg-brand/10 hover:border-brand/20 border border-transparent group transition-all text-left"
                      >
                        <div className="p-2 bg-obsidian-outer border border-white/10 rounded-md text-zinc-muted group-hover:text-brand group-hover:border-brand/30 transition-colors">
                           <item.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-bold text-zinc-text group-hover:text-brand transition-colors truncate">{item.title}</p>
                           {item.subtitle && (
                              <p className="text-[11px] text-zinc-muted mt-0.5 truncate group-hover:text-brand/70">{item.subtitle}</p>
                           )}
                        </div>
                        <CornerDownLeft className="w-3.5 h-3.5 text-zinc-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-muted">
               <Search className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-sm font-medium">No results found for <span className="text-zinc-text">"{query}"</span></p>
               <p className="text-xs mt-2 opacity-60">Try checking for typos or searching a different term.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-obsidian-outer/50 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-muted">
          <div className="flex gap-4">
             <span className="flex items-center gap-1.5"><Command className="w-3 h-3" /> <b>Select</b></span>
             <span className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3" /> <b>Navigate</b></span>
          </div>
          <div>
             Global Context
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
