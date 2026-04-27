import React from 'react';
import { CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { ActivityItem } from '../types';
import { cn } from '@core/lib/utils/cn';

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-success/10',
    text: 'text-success',
    border: 'border-success/20'
  },
  info: {
    icon: Info,
    bg: 'bg-info/10',
    text: 'text-info',
    border: 'border-info/20'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning/10',
    text: 'text-warning',
    border: 'border-warning/20'
  },
  danger: {
    icon: XCircle,
    bg: 'bg-danger/10',
    text: 'text-danger',
    border: 'border-danger/20'
  }
};

import { useLanguage } from '@core/contexts/LanguageContext';

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const { t } = useLanguage();
  
  return (
    <AmberCard className="border-white/5 shadow-lg">
      <div className="flex items-center justify-between mb-6 border-s-2 border-brand ps-3">
        <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em]">
          {t('dash.recent_signals')}
        </h3>
        <button className="text-xs font-black text-brand hover:text-brand/80 uppercase tracking-widest transition-colors">
          {t('common.view_all')}
        </button>
      </div>

      <div className="space-y-3">
        {activities.map((activity) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className={cn(
                'flex gap-3 p-3 rounded-lg border',
                config.bg,
                config.border
              )}
            >
              <div className={cn('p-1.5 rounded', config.bg)}>
                <Icon className={cn('w-4 h-4', config.text)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-text tracking-tight group-hover:text-brand transition-colors">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-xs text-zinc-muted/70 mt-1 font-medium leading-relaxed">
                    {activity.description}
                  </p>
                )}
                <p className="text-[10px] text-zinc-muted/40 uppercase tracking-widest font-black mt-2 font-mono">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </AmberCard>
  );
};
