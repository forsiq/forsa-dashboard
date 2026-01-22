
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Search, Package, Server, Settings, ArrowRight, Database } from 'lucide-react';
import { cn } from '../../lib/cn';

export const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="animate-fade-up max-w-5xl mx-auto py-4 px-2 space-y-8">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-black text-zinc-text tracking-tighter uppercase italic">Global Search Results</h1>
        <p className="text-xs text-zinc-muted font-bold uppercase tracking-widest mt-1 italic">
          Query: <span className="text-brand">"{query}"</span> • Search completed in 24ms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1 space-y-4">
           <h3 className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-4">Filter Results</h3>
           <div className="space-y-1">
              {[
                { name: 'Products', count: 42, icon: Package, active: true },
                { name: 'Infrastructure', count: 3, icon: Server, active: false },
                { name: 'System Core', count: 0, icon: Settings, active: false },
              ].map((cat, i) => (
                <button key={i} className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all border",
                  cat.active ? "bg-brand/10 border-brand/20 text-brand" : "border-transparent text-zinc-muted hover:bg-white/5 hover:text-zinc-text"
                )}>
                  <div className="flex items-center gap-2">
                    <cat.icon className="w-3.5 h-3.5" />
                    {cat.name}
                  </div>
                  <span>{cat.count}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Results Stream */}
        <div className="lg:col-span-3 space-y-4">
           <h3 className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Master Records</h3>
           <div className="space-y-3">
              {[
                { type: 'PRODUCT', id: 'SKU-8821', name: 'Neural-Link Transceiver v2', desc: 'Premium luxury high-fidelity audio equipment with neural-sync.', status: 'VALIDATED' },
                { type: 'PRODUCT', id: 'SKU-0092', name: 'Obsidian Desk Frame', desc: 'Authoritative structural frame for enterprise workstations.', status: 'DRAFT' },
                { type: 'NODE', id: 'AUTH-SEC-01', name: 'Authentication Node (Primary)', desc: 'Security cleared gateway for global cluster access.', status: 'ONLINE' },
              ].map((res, i) => (
                <Card key={i} className="p-4 hover:border-brand/20 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black bg-white/5 px-1.5 py-0.5 rounded text-zinc-muted border border-white/10 tracking-widest uppercase">{res.type}</span>
                        <span className="text-[10px] font-bold text-brand font-mono">{res.id}</span>
                     </div>
                     <ArrowRight className="w-3.5 h-3.5 text-zinc-muted group-hover:text-brand transition-all opacity-0 group-hover:opacity-100" />
                  </div>
                  <h4 className="text-sm font-black text-zinc-text uppercase tracking-tight group-hover:text-brand transition-colors italic">{res.name}</h4>
                  <p className="text-[10px] font-bold text-zinc-muted uppercase mt-1 leading-relaxed opacity-70 italic">{res.desc}</p>
                </Card>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
