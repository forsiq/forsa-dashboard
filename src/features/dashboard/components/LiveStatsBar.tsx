import React from 'react';
import { Activity, Users, Zap, Clock } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';

interface LiveStatsBarProps {
  stats: {
    activeAuctions: number;
    endingSoonAuctions: number;
    recentBidsCount: number;
  } | undefined;
  isLoading: boolean;
  onlineUsers?: number;
}

const statKeys = [
  { key: 'activeAuctions', icon: Activity, color: 'text-success' },
  { key: 'recentBidsCount', icon: Zap, color: 'text-brand' },
  { key: 'endingSoonAuctions', icon: Clock, color: 'text-warning' },
  { key: 'onlineUsers', icon: Users, color: 'text-info' },
] as const;

const labelKeys: Record<string, string> = {
  activeAuctions: 'live.activeAuctions',
  recentBidsCount: 'live.bidsPerHour',
  endingSoonAuctions: 'live.endingSoon',
  onlineUsers: 'live.liveViewers',
};

export const LiveStatsBar: React.FC<LiveStatsBarProps> = ({
  stats,
  isLoading,
  onlineUsers = 0,
}) => {
  const { t } = useLanguage();

  const getValue = (key: string): number => {
    if (key === 'onlineUsers') return onlineUsers;
    return (stats as any)?.[key] ?? 0;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statKeys.map((item) => {
        const Icon = item.icon;
        const value = getValue(item.key);

        return (
          <AmberCard
            key={item.key}
            className="hover:border-zinc-secondary/20 transition-all"
          >
            <div className="space-y-1">
              <p className="text-xs font-black text-zinc-muted uppercase tracking-widest">
                {t(labelKeys[item.key])}
              </p>
              <div className="flex items-center justify-between">
                <p
                  className={cn(
                    'text-2xl font-bold tracking-tight',
                    isLoading ? 'text-zinc-muted/40' : 'text-zinc-text',
                  )}
                >
                  {isLoading ? '--' : value.toLocaleString()}
                </p>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                  <Icon className={cn('w-5 h-5', item.color)} />
                </div>
              </div>
            </div>
            {item.key === 'activeAuctions' && !isLoading && value > 0 && (
              <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-white/[0.03]">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-[10px] font-semibold text-success tracking-widest">
                  {t('live.live')}
                </span>
              </div>
            )}
          </AmberCard>
        );
      })}
    </div>
  );
};
