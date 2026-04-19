import React from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { StatsCard } from '../components/StatsCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { QuickActions } from '../components/QuickActions';
import { useLanguage } from '@core/contexts/LanguageContext';
import { LucideIcon } from 'lucide-react';


export const DashboardHomePage = () => {
  const { t } = useLanguage();
  const { stats, activities, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-muted">{t('dash.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none uppercase">
          {t('dash.title')}
        </h1>
        <p className="text-base text-zinc-secondary font-bold">
          {t('dash.subtitle')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed activities={activities} />
        </div>
        <div>
          <QuickActions actions={[]} />
        </div>
      </div>
    </div>
  );
};
