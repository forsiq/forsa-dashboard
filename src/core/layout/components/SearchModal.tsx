
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Search, X, Database, LayoutTemplate, Settings, History, ArrowRight, Package, ExternalLink, Check, Plus, Command } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

export type Language = 'en' | 'ar' | 'ku';

export interface ServiceItem {
    id: string;
    label: string;
    path: string;
    icon: any;
    color?: string;
    bg?: string;
}

export interface RegistryService {
    id: string;
    name: string;
    desc: string;
    cat: string;
    icon: any;
    enabled?: boolean;
    onToggle?: (id: string) => void;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    suggestedServices?: ServiceItem[];
    recentSearches?: string[];
    serviceRegistry?: RegistryService[];
    showSuggested?: boolean;
    showRegistry?: boolean;
    onNavigate?: (path: string) => void;
    t: (key: string) => string;
    dir: 'ltr' | 'rtl';
}

export const SearchModal: React.FC<SearchModalProps> = ({
    isOpen,
    onClose,
    suggestedServices = [],
    recentSearches = ['SKU-8821', 'Recent Orders', 'Dashboard Analytics'],
    serviceRegistry = [],
    showSuggested = true,
    showRegistry = true,
    onNavigate,
    t,
    dir,
}) => {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Global keyboard shortcut: ⌘K / Ctrl+K to open, ESC to close
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // ⌘K or Ctrl+K to open
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (!isOpen) {
                    // Trigger open via callback
                    window.dispatchEvent(new CustomEvent('search:open'));
                }
            }
            // ESC to close
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Filter registry services
    const foundServices = useMemo(() => {
        if (!query || !showRegistry) return [];
        return serviceRegistry.filter(s =>
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.desc.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, serviceRegistry, showRegistry]);

    // Show "no results" state
    const showNoResults = query.length > 0 && foundServices.length === 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-obsidian-panel border border-white/10 rounded-sm shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300 flex flex-col max-h-[80vh]">
                {/* Search Input Area */}
                <div className="flex items-center px-6 py-5 border-b border-white/5 bg-obsidian-card/40 shrink-0">
                    <Search className="w-5 h-5 text-brand" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('search.placeholder') || "Search..."}
                        className="flex-1 bg-transparent border-none outline-none px-4 text-zinc-text text-lg placeholder-zinc-muted font-medium"
                    />
                    <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-sm transition-colors text-zinc-muted">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto scrollbar-hide">
                    {query.length === 0 ? (
                        <>
                            {/* Recent History */}
                            <section className="space-y-3">
                                <h3 className="flex items-center gap-2 text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em]">
                                    <History className="w-3.5 h-3.5" />
                                    {t('search.recent') || "Recent"}
                                </h3>
                                <div className="space-y-1">
                                    {recentSearches.slice(0, 3).map((item, i) => (
                                        <button key={i} className="w-full flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/5 border border-transparent hover:border-white/5 rounded-sm text-sm text-zinc-secondary group transition-all">
                                            <span>{item}</span>
                                            <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Suggested Modules/Services */}
                            {showSuggested && suggestedServices.length > 0 && (
                                <section className="space-y-3">
                                    <h3 className="flex items-center gap-2 text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em]">
                                        <LayoutTemplate className="w-3.5 h-3.5" />
                                        {t('search.suggested') || "Quick Access"}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {suggestedServices.slice(0, 4).map((service) => (
                                            <button
                                                key={service.id}
                                                onClick={() => {
                                                    if (onNavigate) {
                                                        onNavigate(service.path);
                                                    } else {
                                                        router.push(service.path);
                                                    }
                                                    onClose();
                                                }}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/5 border border-transparent hover:border-brand/20 rounded-sm group transition-all",
                                                    service.bg
                                                )}
                                            >
                                                <service.icon className={cn("w-4 h-4", service.color)} />
                                                <span className="text-[11px] font-black text-zinc-text uppercase tracking-widest">{service.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6">
                            {/* Services Found in Registry */}
                            {foundServices.length > 0 && (
                                <section className="space-y-3">
                                    <h3 className="flex items-center gap-2 text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em]">
                                        <Package className="w-3.5 h-3.5" /> Service Directory
                                    </h3>
                                    <div className="space-y-2">
                                        {foundServices.map((svc) => (
                                            <div key={svc.id} className="flex items-center justify-between p-3 bg-obsidian-outer/50 border border-white/5 rounded-sm hover:border-white/10 transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-sm bg-obsidian-panel border border-white/5 flex items-center justify-center text-zinc-muted group-hover:text-zinc-text">
                                                        <svc.icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-zinc-text">{svc.name}</p>
                                                        <p className="text-[10px] text-zinc-muted">{svc.cat} Module</p>
                                                    </div>
                                                </div>
                                                {svc.onToggle && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            svc.onToggle!(svc.id);
                                                        }}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                                                            svc.enabled
                                                                ? "bg-success/10 text-success border border-success/20 hover:bg-success/20"
                                                                : "bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20"
                                                        )}
                                                    >
                                                        {svc.enabled ? (
                                                            <>Active <Check className="w-3 h-3" /></>
                                                        ) : (
                                                            <>Enable <Plus className="w-3 h-3" /></>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* General Search Results Mockup */}
                            <section className="space-y-3">
                                <h3 className="flex items-center gap-2 text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em]">
                                    <Database className="w-3.5 h-3.5" /> Records & Assets
                                </h3>
                                {showNoResults && (
                                    <p className="text-zinc-muted text-sm py-4 text-center">Searching authoritative data sources for <span className="text-brand font-bold">"{query}"</span>...</p>
                                )}
                                <div className="grid grid-cols-1 gap-2">
                                    {[
                                        { title: `Docs matching "${query}"`, icon: LayoutTemplate },
                                        { title: "System Settings", icon: Settings },
                                    ].map((cat, i) => (
                                        <button key={i} className="flex items-center justify-between p-3 bg-obsidian-card/40 hover:bg-obsidian-card border border-white/5 rounded-sm group transition-all opacity-60 hover:opacity-100">
                                            <div className="flex items-center gap-3">
                                                <cat.icon className="w-4 h-4 text-zinc-muted group-hover:text-brand transition-colors" />
                                                <span className="text-xs font-bold text-zinc-text uppercase tracking-tight">{cat.title}</span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-zinc-muted group-hover:text-brand group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-obsidian-outer/60 border-t border-white/5 flex items-center justify-between shrink-0">
                    <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                        {t('search.global_title') || "Global Search"}
                    </p>
                    <div className="flex gap-4">
                        <span className="text-[10px] font-bold text-zinc-muted uppercase hidden sm:flex items-center gap-1">
                            <kbd className="bg-white/5 px-1 py-0.5 rounded flex items-center gap-0.5">
                                <Command className="w-2.5 h-2.5" /> K
                            </kbd> Open
                        </span>
                        <span className="text-[10px] font-bold text-zinc-muted uppercase"><kbd className="bg-white/5 px-1 py-0.5 rounded mr-1">ESC</kbd> Close</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Hook to open search modal via keyboard shortcut
export const useGlobalSearchShortcut = (onOpen: () => void) => {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleSearchOpen = () => onOpen();
        window.addEventListener('search:open', handleSearchOpen);
        return () => window.removeEventListener('search:open', handleSearchOpen);
    }, [onOpen]);
};
