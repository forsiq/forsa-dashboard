import React from 'react';
import Link from 'next/link';
import { Plus, Gavel, Users, BarChart2, ShoppingBag, Tag } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { QuickAction as QuickActionType } from '../types';
import { cn } from '@core/lib/utils/cn';
import { useLanguage } from '@core/contexts/LanguageContext';

interface QuickActionsProps {
  actions: QuickActionType[];
}

const colorClasses = {
  brand: 'text-brand bg-brand/10 border-brand/20 hover:bg-brand/20',
  info: 'text-info bg-info/10 border-info/20 hover:bg-info/20',
  success: 'text-success bg-success/10 border-success/20 hover:bg-success/20',
  warning: 'text-warning bg-warning/10 border-warning/20 hover:bg-warning/20',
  danger: 'text-danger bg-danger/10 border-danger/20 hover:bg-danger/20'
};

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const { t } = useLanguage();

  const getActions = () => {
    if (actions && actions.length > 0) return actions;
    return [
      { id: '1', label: t('auction.create_auction') || 'New Auction', icon: <Plus className="w-4 h-4" />, path: '/auctions/add', color: 'brand' },
      { id: '2', label: t('auction.listings.title') || 'Auctions', icon: <Gavel className="w-4 h-4" />, path: '/auctions', color: 'warning' },
      { id: '3', label: t('groupBuying.new_campaign') || 'New Deal', icon: <ShoppingBag className="w-4 h-4" />, path: '/group-buying/new', color: 'success' },
      { id: '4', label: t('groupBuying.campaigns') || 'Group Deals', icon: <Users className="w-4 h-4" />, path: '/group-buying', color: 'info' },
      { id: '5', label: t('sidebar.categories') || 'Categories', icon: <Tag className="w-4 h-4" />, path: '/categories', color: 'brand' },
      { id: '6', label: t('sidebar.reports') || 'Reports', icon: <BarChart2 className="w-4 h-4" />, path: '/reports', color: 'warning' },
    ];
  };

  const finalActions = getActions();

  return (
    <AmberCard className="border-white/5 shadow-lg bg-obsidian-panel/80">
      <h3 className="text-xs font-black text-zinc-text uppercase tracking-[0.2em] mb-6 border-s-2 border-brand ps-3">
        {t('dash.quickActions')}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {finalActions.map((action) => (
          <Link
            key={action.id}
            href={action.path}
            className={cn(
              'flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 group hover:-translate-y-1',
              colorClasses[(action.color as keyof typeof colorClasses) || 'brand']
            )}
          >
            <div className="p-3 rounded-full bg-white/5 border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
              {action.icon}
            </div>
            <span className="text-xs font-bold tracking-widest text-center leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </AmberCard>
  );
};
