import React from 'react';
import { StatsCard } from '@core/core/dashboard/StatsCard';
import { PageHeader } from '@core/components/Layout/PageHeader';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useRewardsStats } from '@services/reports/api/rewards-hooks';
import { Star, Gift, Users, TrendingUp, Award } from 'lucide-react';
import type { StatCard } from '@core/core/dashboard/types';

export const EngagementPage = () => {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useRewardsStats();

  const statsCards: StatCard[] = [
    {
      id: 'total-claims',
      title: 'Total Rewards',
      value: data?.totalClaims ?? 0,
      icon: <Gift className="w-4 h-4" />,
      color: 'brand',
    },
    {
      id: 'today-claims',
      title: 'Rewards Today',
      value: data?.todayClaims ?? 0,
      icon: <Star className="w-4 h-4" />,
      color: 'success',
    },
    {
      id: 'total-bonus',
      title: 'Bonus Points Distributed',
      value: data?.totalBonusPoints ?? 0,
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'info',
    },
    {
      id: 'active-users',
      title: 'Users with Rewards',
      value: data?.topUsers?.length ?? 0,
      icon: <Users className="w-4 h-4" />,
      color: 'warning',
    },
  ];

  const tierColors: Record<string, string> = {
    common: 'bg-zinc-100 text-zinc-700',
    rare: 'bg-amber-100 text-amber-700',
    epic: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Engagement & Rewards" />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <StatsCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Tier Distribution */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Reward Tier Distribution
        </h3>
        {data?.tierDistribution && data.tierDistribution.length > 0 ? (
          <div className="space-y-3">
            {data.tierDistribution.map((tier) => (
              <div key={tier.tier} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${tierColors[tier.tier] || 'bg-zinc-100 text-zinc-700'}`}>
                    {tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500">{tier.count} claims</span>
                  <div className="w-24 h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (parseInt(tier.count) / Math.max(1, data.totalClaims)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-400 text-sm">No reward data yet.</p>
        )}
      </div>

      {/* Top Users */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Top Users by Points</h3>
        {data?.topUsers && data.topUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="text-left py-3 px-4 font-medium text-zinc-500">#</th>
                  <th className="text-left py-3 px-4 font-medium text-zinc-500">Phone</th>
                  <th className="text-right py-3 px-4 font-medium text-zinc-500">Bonus Points</th>
                  <th className="text-right py-3 px-4 font-medium text-zinc-500">Total Points</th>
                </tr>
              </thead>
              <tbody>
                {data.topUsers.map((user, i) => (
                  <tr key={user.userUuid} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="py-3 px-4 text-zinc-400">{i + 1}</td>
                    <td className="py-3 px-4 text-zinc-900 font-medium">{user.phone || user.userUuid?.slice(0, 8) + '...'}</td>
                    <td className="py-3 px-4 text-right text-amber-600 font-medium">{user.bonusPoints}</td>
                    <td className="py-3 px-4 text-right text-brand-600 font-bold">{user.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-zinc-400 text-sm">No users with bonus points yet.</p>
        )}
      </div>
    </div>
  );
};
