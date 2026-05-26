'use client';

import React from 'react';
import { useRouter } from 'next/router';
import { Bell } from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { MobileHeader } from './MobileHeader';

export function LayoutMobileHeader() {
  const router = useRouter();
  const { t } = useLanguage();

  const routeTitles: Record<string, string> = {
    '/dashboard': t('dash.title') || 'Dashboard',
    '/auctions': t('sidebar.auctions') || 'Auctions',
    '/orders': t('sidebar.orders_section') || 'Orders',
    '/watchlist': t('sidebar.watchlist') || 'Watchlist',
    '/my-bids': t('sidebar.my_bids') || 'My Bids',
    '/inventory': t('sidebar.inventory') || 'Inventory',
    '/customers': t('sidebar.customers') || 'Customers',
    '/categories': t('sidebar.categories') || 'Categories',
    '/reports': t('sidebar.reports') || 'Reports',
    '/settings': t('sidebar.settings') || 'Settings',
    '/group-buying': t('sidebar.groupBuying') || 'Group Buying',
    '/portal': t('sidebar.portal') || 'Portal',
  };

  const title =
    routeTitles[router.pathname] || t('app.name') || 'Forsa';

  return (
    <MobileHeader
      title={title}
      showBack={false}
      rightActions={
        <button className="relative p-2 rounded-lg text-zinc-muted hover:text-zinc-text hover:bg-white/10 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      }
    />
  );
}
