import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Edit,
    Trash2,
    Eye,
    ChevronRight,
    CheckSquare,
    Square,
    X,
    Filter,
    ArrowRightLeft,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { AmberButton } from '@core/components/AmberButton';
import { AmberCard } from '@core/components/AmberCard';
import { ExampleItem } from '../types';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';

interface ExampleTableProps {
  data: ExampleItem[];
  isLoading?: boolean;
  onEdit?: (item: ExampleItem) => void;
  onDelete?: (item: ExampleItem) => void;
}

export const ExampleTable: React.FC<ExampleTableProps> = ({
  data,
  isLoading,
  onEdit,
  onDelete
}) => {
  const { t, dir } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map(i => i.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRowIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRowIds(newSet);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success bg-success/10 border-success/20';
      case 'pending': return 'text-warning bg-warning/10 border-warning/20';
      case 'inactive': return 'text-zinc-muted bg-white/5 border-white/10';
      default: return 'text-zinc-muted';
    }
  };

  if (!isClient) return null;

  if (isLoading) {
    return (
      <AmberCard className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <span className="ms-3 text-sm text-zinc-muted font-bold uppercase tracking-widest">{t('common.loading')}</span>
      </AmberCard>
    );
  }

  if (data.length === 0) {
    return (
      <AmberCard>
        <div className="flex flex-col items-center justify-center p-16 text-center space-y-6">
          <div className="p-4 bg-white/5 rounded-full">
            <Filter className="w-10 h-10 text-zinc-muted/20" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-zinc-text uppercase tracking-widest">No Records Found</h3>
            <p className="text-xs text-zinc-muted uppercase tracking-tight font-medium">Try adjusting your filters or search query.</p>
          </div>
          <Link href="/example/new">
            <AmberButton size="sm" className="bg-brand text-black font-black uppercase tracking-widest h-10 px-8">
              Create First Record
            </AmberButton>
          </Link>
        </div>
      </AmberCard>
    );
  }

  return (
    <div className="space-y-4 relative">
      {/* Bulk Actions Floating Bar */}
      <div className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 bg-obsidian-panel border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-full px-6 py-3 flex items-center gap-6 z-[100] transition-all duration-500",
        selectedIds.size > 0 ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}>
        <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest border-e border-white/10 pe-6">
          {selectedIds.size} {t('portal.selected')}
        </span>
        <div className="flex items-center gap-3">
          <button className="p-2 text-zinc-muted hover:text-brand transition-all hover:bg-white/5 rounded-full" title={t('common.export')}>
            <ArrowRightLeft className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete?.(data.find(d => selectedIds.has(d.id))!)} className="p-2 text-zinc-muted hover:text-danger transition-all hover:bg-white/5 rounded-full" title={t('common.delete')}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        <button onClick={() => setSelectedIds(new Set())} className="ms-2 p-1.5 bg-white/10 rounded-full text-zinc-muted hover:bg-white/20 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <AmberCard noPadding className="overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-start" dir={dir}>
            <thead className="bg-obsidian-outer/40 border-b border-white/5">
              <tr>
                <th className="w-12 px-6 py-5 text-center">
                  <button onClick={toggleSelectAll} className="p-1 hover:text-brand transition-colors text-zinc-muted">
                    {selectedIds.size > 0 && selectedIds.size === data.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="w-10"></th>
                <th className="px-6 py-5 text-xs font-black text-zinc-muted uppercase tracking-[0.2em]">{t('rec.table.name')}</th>
                <th className="px-6 py-5 text-xs font-black text-zinc-muted uppercase tracking-[0.2em]">{t('rec.table.module')}</th>
                <th className="px-6 py-5 text-xs font-black text-zinc-muted uppercase tracking-[0.2em]">{t('common.status')}</th>
                <th className="px-6 py-5 text-xs font-black text-zinc-muted uppercase tracking-[0.2em]">{t('common.date')}</th>
                <th className="px-6 py-5 text-end text-xs font-black text-zinc-muted uppercase tracking-[0.2em]">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {data.map((item) => {
                const isExpanded = expandedRowIds.has(item.id);
                const isSelected = selectedIds.has(item.id);

                return (
                  <React.Fragment key={item.id}>
                    <tr className={cn(
                      "hover:bg-white/[0.02] transition-colors group",
                      isExpanded && "bg-white/[0.02]",
                      isSelected && "bg-brand/[0.03]"
                    )}>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => toggleSelect(item.id)} className={cn("p-1 transition-colors", isSelected ? "text-brand" : "text-zinc-muted-70")}>
                          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-2 py-4">
                        <button
                          onClick={() => toggleRow(item.id)}
                          className={cn(
                            "p-1.5 rounded-lg text-zinc-muted hover:text-brand hover:bg-white/5 transition-all duration-300",
                            isExpanded && "text-brand rotate-90"
                          )}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-text tracking-tight group-hover:text-brand transition-colors">{item.title}</span>
                          <span className="text-xs text-zinc-muted/60 font-mono tracking-tighter mt-0.5">{item.id.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] md:text-xs font-black text-zinc-muted border border-white/5 px-2 py-1 rounded bg-white/5 uppercase tracking-widest">{item.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] md:text-[10px] font-black px-2 py-1 rounded border uppercase tracking-[0.2em] inline-flex items-center gap-2",
                          getStatusColor(item.status)
                        )}>
                          {item.status === 'pending' && <AlertTriangle className="w-3 h-3 animate-pulse" />}
                          {t(`status.${item.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-muted font-bold font-mono tracking-tighter">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-end">
                        <div className="flex justify-end gap-1 px-1">
                          <Link
                            href={`/example/${item.id}`}
                            className="p-2 text-zinc-muted hover:text-brand hover:bg-white/5 rounded-xl transition-all"
                            title={t('common.view_all')}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => onEdit?.(item)}
                            className="p-2 text-zinc-muted hover:text-brand hover:bg-white/5 rounded-xl transition-all"
                            title={t('common.edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row Content */}
                    <tr className={cn(
                      "overflow-hidden transition-all duration-500",
                      !isExpanded && "hidden"
                    )}>
                      <td colSpan={7} className="px-6 py-0 pb-6 bg-white/[0.01]">
                        <div className="ms-20 me-6 p-6 border border-dashed border-zinc-secondary/20 rounded-2xl bg-obsidian-card shadow-inner space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <h4 className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] font-black">{t('form.resource_desc')}</h4>
                                 <p className="text-xs text-zinc-muted/80 leading-relaxed font-medium">
                                    {item.description || 'No detailed description available for this record.'}
                                 </p>
                              </div>
                              <div className="space-y-4">
                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-1">
                                        <p className="text-[10px] font-black text-zinc-muted/40 uppercase tracking-widest">{t('details.uuid')}</p>
                                        <p className="text-[10px] font-mono text-zinc-muted">{item.id}</p>
                                     </div>
                                     <div className="space-y-1">
                                        <p className="text-[10px] font-black text-zinc-muted/40 uppercase tracking-widest">{t('rec.table.date')}</p>
                                        <p className="text-[10px] font-mono text-zinc-muted">{new Date(item.createdAt).toISOString()}</p>
                                     </div>
                                 </div>
                                 <div className="flex gap-2">
                                     <button className="flex-1 py-1.5 border border-white/10 rounded-sm text-[10px] font-black text-zinc-muted uppercase tracking-widest hover:bg-white/5 hover:text-zinc-text transition-all">
                                         {t('hub.tab.telemetry')}
                                     </button>
                                     <button className="flex-1 py-1.5 border border-white/10 rounded-sm text-[10px] font-black text-zinc-muted uppercase tracking-widest hover:bg-white/5 hover:text-zinc-text transition-all">
                                         {t('hub.tab.vault')}
                                     </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination Footer */}
        <div className="px-6 py-5 border-t border-white/5 bg-obsidian-outer/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-black text-zinc-muted/40 uppercase tracking-[0.3em]">
            {t('proj.showing')} 1-10 {t('proj.of')} {data.length} {t('portal.items')}
          </p>
          <div className="flex gap-2">
            <button className="px-5 py-2 bg-obsidian-card border border-white/5 rounded-sm text-[10px] font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest hover:bg-white/5 transition-all">
              {t('common.previous')}
            </button>
            <button className="px-5 py-2 bg-obsidian-card border border-white/5 rounded-sm text-[10px] font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest hover:bg-white/5 transition-all">
              {t('common.next')}
            </button>
          </div>
        </div>
      </AmberCard>
    </div>
  );
};
