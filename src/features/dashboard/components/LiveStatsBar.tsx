import React from 'react';
import { Activity, Users, Zap, Clock } from 'lucide-react';
import { cn } from '@core/lib/utils/cn';

interface LiveStatsBarProps {
  stats: {
    activeAuctions: number;
    endingSoonAuctions: number;
    recentBidsCount: number;
  } | undefined;
  isLoading: boolean;
  onlineUsers?: number;
}

const statItems = [
  {
    key: 'activeAuctions',
    label: 'Active Auctions',
    icon: Activity,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
  },
  {
    key: 'recentBidsCount',
    label: 'Bids / Hour',
    icon: Zap,
    color: 'text-brand',
    bgColor: 'bg-brand/10',
    borderColor: 'border-brand/20',
  },
  {
    key: 'endingSoonAuctions',
    label: 'Ending Soon',
    icon: Clock,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
  },
  {
    key: 'onlineUsers',
    label: 'Live Viewers',
    icon: Users,
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/20',
  },
];

export const LiveStatsBar: React.FC<LiveStatsBarProps> = ({
  stats,
  isLoading,
  onlineUsers = 0,
}) => {
  const getValue = (key: string): number => {
    if (key === 'onlineUsers') return onlineUsers;
    return (stats as any)?.[key] ?? 0;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statItems.map((item) => {
        const Icon = item.icon;
        const value = getValue(item.key);

        return (
          <div
            key={item.key}
            className={cn(
              'relative flex items-center gap-3 p-4 rounded-2xl border transition-all',
              item.bgColor,
              item.borderColor,
            )}
          >
            <div
              className={cn(
                'p-2.5 rounded-xl bg-white/5 border border-white/5',
              )}
            >
              <Icon className={cn('w-5 h-5', item.color)} />
            </div>
            <div>
              <p
                className={cn(
                  'text-2xl font-black tracking-tight',
                  isLoading
                    ? 'text-zinc-muted/40'
                    : 'text-zinc-text',
                )}
              >
                {isLoading ? '--' : value.toLocaleString()}
              </p>
              <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
                {item.label}
              </p>
            </div>

            {item.key === 'activeAuctions' && !isLoading && value > 0 && (
              <span className="absolute top-3 right-3 w-2 h-2 bg-success rounded-full animate-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
};
