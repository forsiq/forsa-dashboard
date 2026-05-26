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
    '/auctions': t('mobile.nav.channels') || 'Channels',
    '/orders': t('mobile.nav.orders') || 'Orders',
    '/watchlist': t('mobile.nav.watchlist') || 'Watchlist',
    '/my-bids': t('mobile.nav.my_bids') || 'My Bids',
    '/inventory': t('mobile.nav.inventory') || 'Inventory',
    '/customers': t('mobile.nav.customers') || 'Customers',
    '/categories': t('mobile.nav.categories') || 'Categories',
    '/reports': t('mobile.nav.reports') || 'Reports',
    '/settings': t('mobile.nav.settings') || 'Settings',
    '/group-buying': t('mobile.nav.channels') || 'Channels',
    '/listings': t('mobile.nav.products') || 'Products',
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
