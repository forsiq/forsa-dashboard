import React from 'react';
import { AmberCard } from '@core/components/AmberCard';
import { useLanguage } from '@core/contexts/LanguageContext';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { TrendingUp, Package, Eye } from 'lucide-react';

interface TopAuctionsProps {
  products: any[];
}

export const TopAuctions: React.FC<TopAuctionsProps> = ({ products }) => {
  const { t } = useLanguage();

  return (
    <AmberCard className="!p-4 sm:!p-6 flex flex-col min-w-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-white/5 pb-4">
         <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] border-s-2 border-brand ps-3">
           {t('dash.top_performing')}
         </h3>
      </div>
      
      <div className="flex-1 space-y-3 min-w-0">
        {products.length === 0 ? (
          <div className="h-40 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
             <span className="text-[11px] font-semibold text-zinc-muted tracking-widest">{t('common.no_data')}</span>
          </div>
        ) : (
          products.map((item, index) => (
            <div
              key={item.id}
              className="group relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand/30 transition-all duration-300 min-w-0"
            >
               <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                 <div
                   className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-black tabular-nums shrink-0"
                   style={{
                     background: index === 0 ? 'var(--color-brand)' : index === 1 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                     color: index === 0 ? '#000' : 'var(--color-zinc-muted)',
                   }}
                 >
                    {index + 1}
                 </div>
                 <div className="min-w-0 flex-1">
                   <p className="text-sm font-bold text-zinc-text tracking-tight line-clamp-2 sm:truncate">{item.name}</p>
                   <p className="text-[11px] font-semibold text-zinc-muted mt-0.5 truncate">
                     {item.category || t('common.uncategorized')}
                   </p>
                 </div>
               </div>
               
               <div className="flex items-center gap-4 sm:gap-5 shrink-0 ps-10 sm:ps-0">
                 <div className="text-end min-w-[72px]">
                   <p className="text-[11px] font-semibold text-zinc-muted mb-0.5">{t('dash.revenue')}</p>
                   <p className="text-xs sm:text-sm font-bold text-brand tabular-nums whitespace-nowrap">{formatCurrency(item.revenue)}</p>
                 </div>
                 <div className="text-end min-w-[56px]">
                    <p className="text-[11px] font-semibold text-zinc-muted mb-0.5">{t('dash.sales')}</p>
                    <div className="flex items-center gap-1.5 justify-end">
                       {item.sales > 0 ? (
                         <TrendingUp className="w-3 h-3 text-success shrink-0" />
                       ) : (
                         <Eye className="w-3 h-3 text-zinc-muted shrink-0" />
                       )}
                       <span className="text-xs sm:text-sm font-bold text-zinc-text tabular-nums">
                         {item.sales > 0 ? item.sales : (item.stock || 0)}
                       </span>
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
