/**
 * Auctions List Page
 *
 * Displays all auctions with filters and search
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, Plus, Filter, Search } from 'lucide-react';
import { useAuctions, useAuctionStats } from '../hooks/useAuctions';
import type { AuctionStatus } from '../types/auction.types';

// Amber UI components (from template)
const Button = ({ className, children, ...props }: any) => (
  <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const Card = ({ className, children, ...props }: any) => (
  <div className={`bg-white/5 border border-white/10 rounded-xl ${className}`} {...props}>
    {children}
  </div>
);

const Badge = ({ status }: { status: AuctionStatus }) => {
  const styles: Record<AuctionStatus, string> = {
    active: 'bg-green-500/20 text-green-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
    ended: 'bg-zinc-500/20 text-zinc-400',
    draft: 'bg-yellow-500/20 text-yellow-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
};

export const AuctionsList = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<AuctionStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: auctionsData, isLoading, error } = useAuctions({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery || undefined,
    sortBy: 'endTime',
    sortOrder: 'asc',
  });

  const { data: stats } = useAuctionStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading auctions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Failed to load auctions</div>
      </div>
    );
  }

  const auctions = auctionsData?.data || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Auctions</h1>
          <p className="text-zinc-400 mt-1">
            {stats?.activeAuctions || 0} active · {stats?.scheduledAuctions || 0} scheduled
          </p>
        </div>
        <Button
          className="bg-brand hover:bg-brand/90 text-white flex items-center gap-2"
          onClick={() => navigate('/auctions/add')}
        >
          <Plus size={18} />
          Create Auction
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-zinc-400 text-sm">Total Auctions</div>
            <div className="text-2xl font-bold text-white mt-1">{stats.totalAuctions}</div>
          </Card>
          <Card className="p-4">
            <div className="text-zinc-400 text-sm">Active Now</div>
            <div className="text-2xl font-bold text-green-400 mt-1">{stats.activeAuctions}</div>
          </Card>
          <Card className="p-4">
            <div className="text-zinc-400 text-sm">Total Bids</div>
            <div className="text-2xl font-bold text-brand mt-1">{stats.totalBids}</div>
          </Card>
          <Card className="p-4">
            <div className="text-zinc-400 text-sm">Revenue</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">
              ${stats.totalRevenue?.toLocaleString()}
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-brand"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-zinc-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="ended">Ended</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Auctions List */}
      {auctions.length === 0 ? (
        <Card className="p-12 text-center">
          <Gavel size={48} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No auctions found</h3>
          <p className="text-zinc-400 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first auction'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button
              className="bg-brand hover:bg-brand/90 text-white mx-auto"
              onClick={() => navigate('/auctions/add')}
            >
              Create Auction
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {auctions.map((auction) => (
            <Card
              key={auction.id}
              className="overflow-hidden cursor-pointer hover:border-brand/50 transition-colors"
              onClick={() => navigate(`/auctions/${auction.id}`)}
            >
              {/* Image */}
              {auction.images[0] && (
                <div className="h-40 bg-zinc-800 relative">
                  <img
                    src={auction.images[0]}
                    alt={auction.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge status={auction.status} />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-medium text-white truncate">{auction.title}</h3>
                  <p className="text-sm text-zinc-400 truncate">{auction.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-zinc-500">Current Bid</div>
                    <div className="text-lg font-bold text-white">
                      ${auction.currentBid.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">{auction.totalBids} bids</div>
                  </div>
                </div>

                {auction.status === 'active' && auction.timeRemaining && (
                  <div className="text-xs text-brand">
                    Ends in {Math.floor(auction.timeRemaining / 360000)}h
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuctionsList;
