import Link from 'next/link';
import { AmberCard } from '@core/components/AmberCard';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';
import type { QuickAction } from '@core/core/dashboard/types';

const colorClasses = {
  brand: 'text-brand bg-brand/10 border-brand/20 hover:bg-brand/20',
  info: 'text-info bg-info/10 border-info/20 hover:bg-info/20',
  success: 'text-success bg-success/10 border-success/20 hover:bg-success/20',
  warning: 'text-warning bg-warning/10 border-warning/20 hover:bg-warning/20',
  danger: 'text-danger bg-danger/10 border-danger/20 hover:bg-danger/20',
};

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions = ({ actions }: QuickActionsProps) => {
  const { t } = useLanguage();

  return (
    <AmberCard className="border-white/5 shadow-lg bg-obsidian-panel/80">
      <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em] mb-6 border-s-2 border-brand ps-3">
        {t('dash.quickActions')}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.path}
            className={cn(
              'relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 group hover:-translate-y-1',
              colorClasses[action.color || 'brand']
            )}
          >
            {action.count !== undefined && action.count > 0 && (
              <span
                className={cn(
                  'absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full text-[9px] font-black flex items-center justify-center tabular-nums z-10',
                  action.isActive
                    ? 'bg-success text-black shadow-lg shadow-success/20'
                    : 'bg-obsidian-card text-zinc-muted border border-white/10'
                )}
              >
                {action.count > 99 ? '99+' : action.count}
              </span>
            )}
            {action.isActive && (
              <span className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            )}
            <div className="p-3 rounded-full bg-white/5 border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
              {action.icon}
            </div>
            <span className="text-[10px] font-bold tracking-widest text-center leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </AmberCard>
  );
};
