import React from 'react';
import { AmberCard } from '@core/components/AmberCard';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { TrendingUp, Package } from 'lucide-react';

interface TopAuctionsProps {
  products: any[];
}

export const TopAuctions: React.FC<TopAuctionsProps> = ({ products }) => {
  const { t } = useLanguage();

  return (
    <AmberCard className="!p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
         <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em] border-l-2 border-brand pl-3">
           {t('dash.top_performing') || 'Top Performing Items'}
         </h3>
      </div>
      
      <div className="flex-1 space-y-4">
        {products.length === 0 ? (
          <div className="h-40 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
             <span className="text-[10px] font-semibold text-zinc-muted tracking-widest">{t('common.no_data')}</span>
          </div>
        ) : (
          products.map((item, index) => (
            <div key={item.id} className="group relative flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand/30 transition-all duration-300">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-obsidian-outer border border-white/5 flex items-center justify-center text-zinc-muted group-hover:text-brand transition-colors">
                    <Package className="w-5 h-5" />
                 </div>
                 <div className="min-w-0">
                   <p className="text-xs font-bold text-zinc-text tracking-tight truncate max-w-[150px]">{item.name}</p>
                   <p className="text-[10px] font-semibold text-zinc-muted tracking-widest mt-0.5">{item.category}</p>
                 </div>
               </div>
               
               <div className="flex items-center gap-6">
                 <div className="text-right">
                   <p className="text-[10px] font-semibold text-zinc-muted tracking-widest mb-0.5">{t('dash.revenue') || 'Revenue'}</p>
                   <p className="text-sm font-bold text-brand tabular-nums">{formatCurrency(item.revenue)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-semibold text-zinc-muted tracking-widest mb-0.5">{t('dash.sales') || 'Sales'}</p>
                    <div className="flex items-center gap-1.5 justify-end">
                       <TrendingUp className="w-3 h-3 text-success" />
                       <span className="text-sm font-bold text-zinc-text tabular-nums">{item.sales}</span>
                    </div>
                 </div>
               </div>
            </div>
          ))
        )}
      </div>
    </AmberCard>
  );
};
