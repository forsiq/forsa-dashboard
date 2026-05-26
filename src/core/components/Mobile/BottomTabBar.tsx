'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Gavel, Package, Heart, Menu } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';

interface TabItem {
  icon: React.ElementType;
  label: string;
  path: string;
  isMore?: boolean;
}

export interface BottomTabBarProps {
  onMorePress: () => void;
}

export function BottomTabBar({ onMorePress }: BottomTabBarProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const tabs: TabItem[] = useMemo(
    () => [
      { icon: Home, label: t('mobile.nav.home') || 'Home', path: '/dashboard' },
      { icon: Gavel, label: t('mobile.nav.auctions') || 'Auctions', path: '/auctions' },
      { icon: Package, label: t('mobile.nav.orders') || 'Orders', path: '/orders' },
      { icon: Heart, label: t('mobile.nav.watchlist') || 'Watchlist', path: '/watchlist' },
      { icon: Menu, label: t('mobile.nav.more') || 'More', path: '', isMore: true },
    ],
    [t],
  );

  const isActive = (path: string) => {
    if (!path) return false;
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 h-16 bg-obsidian-card border-t border-white/5 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {tabs.map((tab) => {
        const active = tab.isMore ? false : isActive(tab.path);
        const Icon = tab.icon;

        if (tab.isMore) {
          return (
            <button
              key="more"
              onClick={onMorePress}
              className="flex-1 flex flex-col items-center justify-center gap-1 text-zinc-muted hover:text-brand transition-colors"
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {tab.label}
              </span>
            </button>
          );
        }

        return (
          <Link
            key={tab.path}
            href={tab.path}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <Icon className={`w-5 h-5 ${active ? 'text-brand' : 'text-zinc-muted'}`} />
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${
                active ? 'text-brand' : 'text-zinc-muted'
              }`}
            >
              {tab.label}
            </span>
            {active && <div className="w-1 h-1 rounded-full bg-brand" />}
          </Link>
        );
      })}
    </nav>
  );
}
