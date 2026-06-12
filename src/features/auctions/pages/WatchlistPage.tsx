import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Heart,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  Layers,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { formatCurrency } from '@core/lib/utils/formatCurrency';
import { useIsMobile } from '@core/hooks/useIsMobile';
import { AmberCard as Card } from '@core/components/AmberCard';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column } from '@core/components/Data/DataTable';
import { DataTableEntityTitle } from '@core/components/Data/DataTableEntityTitle';
import { useWatchedAuctions } from '../api';
import { useList as useCategories } from '@services/categories/hooks';
import { getLocalizedName } from '@services/categories/types';
import { useFilterState } from '@core/hooks/useFilterState';
import { getCountdown } from '@core/utils/countdown';
import { EmptyState } from '@core/components/EmptyState';
import { AdminListPageShell } from '@core/components/Layout';
import { ListPageSkeleton } from '@core/loading';
import type { Auction } from '../types/auction.types';

export const WatchlistPage: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const [isClient, setIsClient] = useState(false);
  const [sortBy, setSortBy] = useFilterState<string>('sortBy', 'title');
  const [sortOrder, setSortOrder] = useFilterState<'asc' | 'desc'>('sortOrder', 'asc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: auctions, isLoading } = useWatchedAuctions();

  const { data: categoriesData } = useCategories({ limit: 100 });
  const categoryMap = useMemo(() => {
    const cats = categoriesData?.categories || [];
    return new Map(cats.map((c) => [String(c.id), getLocalizedName(c, language)]));
  }, [categoriesData, language]);

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(direction);
  };

  const columns: Column<Auction>[] = [
    {
      key: 'title',
      label: t('auction.table.identification') || 'Auction',
      cardTitle: true,
      render: (auction) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 text-danger fill-danger" />
          </div>
          <div className="min-w-0">
            <DataTableEntityTitle text={auction.title} />
            <p className="text-[11px] font-bold text-zinc-muted uppercase tracking-widest mt-0.5">
              {categoryMap.get(String(auction.categoryId)) || auction.categoryName || t('auction.detail.general')}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: t('auction.table.state') || 'Status',
      cardBadge: true,
      render: (auction) => (
        <StatusBadge
          status={auction.status}
          labelKey={`auction.status.${auction.status}`}
          variant={auction.status === 'active' ? 'success' : auction.status === 'ended' ? 'failed' : 'warning'}
          size="sm"
        />
      ),
      align: 'center',
    },
    {
      key: 'currentBid',
      label: t('auction.table.premium_value') || 'Price',
      render: (auction) => (
        <span className="text-base font-black text-brand tabular-nums leading-none tracking-tight">
          {(auction.currentBid || auction.startPrice).toLocaleString()}
        </span>
      ),
      align: 'right',
    },
    {
      key: 'endTime',
      label: t('auction.table.protocol_duration') || 'Time Left',
      render: (auction) => {
        const raw = getCountdown(auction.endTime);
        const label = raw === 'ENDED' ? (t('TIME.ENDED') || 'ENDED') : raw;
        return (
        <div className="inline-flex items-center gap-2 text-xs font-black text-warning tabular-nums bg-warning/10 px-3 py-1 rounded-full border border-warning/20">
          <Clock className="w-3 h-3" />
          {label}
        </div>
        );
      },
      align: 'center',
    },
    {
      key: 'totalBids',
      label: t('auction.table.interactions') || 'Bids',
      render: (auction) => (
        <div className="flex items-center justify-end gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-success" />
          <span className="font-black text-zinc-text text-sm tabular-nums">{auction.totalBids || 0}</span>
        </div>
      ),
      align: 'right',
    },
  ];

  if (!isClient) return null;

  return (
    <AdminListPageShell
      title={t('auction.watchlist') || 'Watchlist'}
      description={t('auction.watched_auctions') || 'Auctions you are watching'}
      icon={Heart}
      iconClassName="fill-danger"
      iconTileClassName="bg-danger/10 text-danger border-danger/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
      className="p-3 md:p-6 space-y-4 md:space-y-8"
    >
      {isLoading ? (
        <ListPageSkeleton count={5} columns={3} />
      ) : !auctions || auctions.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t('auction.no_watched') || 'No Watched Auctions'}
          description={t('auction.no_watched_desc') || "You haven't added any auctions to your watchlist yet."}
        />
      ) : (
        <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={auctions}
            keyField="id"
            onRowClick={(row) => router.push(`/auctions/${row.id}`)}
            pagination
            pageSize={10}
            currentPage={page}
            totalItems={auctions.length}
            onPageChange={(newPage) => setPage(newPage)}
            showViewToggle
            viewMode={isMobile ? 'grid' : 'table'}
            gridCols={2}
            onSortChange={handleSortChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </div>
      )}
    </AdminListPageShell>
  );
};

export default WatchlistPage;
