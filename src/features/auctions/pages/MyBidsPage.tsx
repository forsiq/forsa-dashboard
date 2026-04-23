import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Gavel,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  Layers,
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { DataTable, Column } from '@core/components/Data/DataTable';
import { useGetMyBids } from '../api';

interface BidRow {
  id: number;
  auctionId: number;
  auctionTitle: string;
  amount: number;
  status: string;
  createdAt: string;
  auctionStatus?: string;
}

export const MyBidsPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: bidsData, isLoading } = useGetMyBids();
  const bids = (bidsData?.data || []) as unknown as BidRow[];

  const columns: Column<BidRow>[] = [
    {
      key: 'auctionTitle',
      label: t('auction.table.identification') || 'Auction',
      cardTitle: true,
      render: (bid) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <Gavel className="w-4 h-4 text-brand" />
          </div>
          <div>
            <p className="text-sm font-black text-zinc-text uppercase tracking-tight">{bid.auctionTitle}</p>
            <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest mt-0.5">#{bid.auctionId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: t('auction.table.premium_value') || 'Bid Amount',
      render: (bid) => (
        <span className="text-base font-black text-brand tabular-nums leading-none tracking-tight">
          ${bid.amount.toLocaleString()}
        </span>
      ),
      sortable: true,
      align: 'right',
    },
    {
      key: 'status',
      label: t('auction.table.state') || 'Status',
      cardBadge: true,
      render: (bid) => (
        <StatusBadge
          status={bid.status || 'active'}
          variant={bid.status === 'winning' ? 'success' : bid.status === 'outbid' ? 'warning' : 'info'}
          size="sm"
        />
      ),
      align: 'center',
    },
    {
      key: 'createdAt',
      label: t('common.date') || 'Date',
      render: (bid) => {
        const date = new Date(bid.createdAt);
        return (
          <span className="text-sm text-zinc-muted">
            {!isNaN(date.getTime()) ? date.toLocaleDateString() : '-'}
          </span>
        );
      },
      align: 'center',
    },
  ];

  if (!isClient) return null;

  return (
    <div className="space-y-8 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700" dir={dir}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-sm bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-[0_0_15px_rgba(245,196,81,0.1)]">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-zinc-text tracking-tighter leading-none uppercase">
            {t('auction.my_bids') || 'My Bids'}
          </h1>
          <p className="text-base text-zinc-muted font-bold tracking-tight uppercase mt-1">
            {t('auction.bidding_history') || 'Track your bidding activity'}
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
      ) : bids.length === 0 ? (
        <Card className="!p-24 text-center space-y-6 bg-obsidian-card/40">
          <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto border border-white/[0.05]">
            <Gavel className="w-10 h-10 text-zinc-muted/30" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-black text-zinc-text uppercase tracking-widest">
              {t('auction.no_bids') || 'No Bids Yet'}
            </h3>
            <p className="text-sm text-zinc-muted font-bold tracking-tight">
              {t('auction.no_bids_desc') || "You haven't placed any bids yet. Start bidding on auctions!"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
          <DataTable
            columns={columns}
            data={bids}
            keyField="id"
            onRowClick={(row) => router.push(`/auctions/${row.auctionId}`)}
            pagination
            pageSize={10}
          />
        </div>
      )}
    </div>
  );
};

export default MyBidsPage;
