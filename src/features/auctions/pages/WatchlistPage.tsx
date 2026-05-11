import React, { useState, useEffect } from 'react';
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
import { AmberCard as Card } from '@core/components/AmberCard';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column } from '@core/components/Data/DataTable';
import { DataTableEntityTitle } from '@core/components/Data/DataTableEntityTitle';
import { useWatchedAuctions } from '../api';
import type { Auction } from '../types/auction.types';

export const WatchlistPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: auctions, isLoading } = useWatchedAuctions();

  const getCountdown = (endTimeStr: string) => {
    if (!endTimeStr) return 'TBD';
    const end = new Date(endTimeStr);
    const diff = end.getTime() - currentTime.getTime();
    if (diff <= 0) return t('TIME.ENDED') || 'ENDED';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${mins}m`;
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
            <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest mt-0.5">
              {auction.categoryName || t('auction.detail.general')}
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
          status={t(`auction.status.${auction.status}`) || auction.status}
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
      render: (auction) => (
        <div className="inline-flex items-center gap-2 text-[10px] font-black text-warning tabular-nums bg-warning/10 px-3 py-1 rounded-full border border-warning/20">
          <Clock className="w-3 h-3" />
          {getCountdown(auction.endTime)}
        </div>
      ),
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
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-sm bg-danger/10 flex items-center justify-center text-danger border border-danger/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <Heart className="w-6 h-6 fill-danger" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-zinc-text tracking-tighter leading-none uppercase">
            {t('auction.watchlist') || 'Watchlist'}
          </h1>
          <p className="text-base text-zinc-muted font-bold tracking-tight uppercase mt-1">
            {t('auction.watched_auctions') || 'Auctions you are watching'}
          </p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white/[0.02] border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      ) : !auctions || auctions.length === 0 ? (
        <Card className="!p-24 text-center space-y-6 bg-obsidian-card/40">
          <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto border border-white/[0.05]">
            <Heart className="w-10 h-10 text-zinc-muted/30" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-black text-zinc-text uppercase tracking-widest">
              {t('auction.no_watched') || 'No Watched Auctions'}
            </h3>
            <p className="text-sm text-zinc-muted font-bold tracking-tight">
              {t('auction.no_watched_desc') || "You haven't added any auctions to your watchlist yet."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={auctions}
            keyField="id"
            onRowClick={(row) => router.push(`/auctions/${row.id}`)}
            pagination
            pageSize={10}
          />
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
