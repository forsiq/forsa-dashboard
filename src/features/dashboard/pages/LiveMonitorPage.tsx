import React from 'react';
import { useGlobalTicker } from '../../bidding/hooks/useGlobalTicker';
import { useLiveStats } from '../../auctions/api/auction-hooks';
import { LiveStatsBar } from '../components/LiveStatsBar';
import { GlobalBidTicker } from '../components/GlobalBidTicker';
import { ActiveAuctionsGrid } from '../components/ActiveAuctionsGrid';
import { TickerHistoryLoader } from '../components/TickerHistoryLoader';

export const LiveMonitorPage = () => {
  const { events, isConnected, error, clearEvents } = useGlobalTicker({
    enabled: true,
    maxEvents: 200,
  });

  const { data: liveStats, isLoading: statsLoading } = useLiveStats();

  return (
    <div className="space-y-6 p-6 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-zinc-text tracking-tight leading-none uppercase">
              Live Monitor
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                isConnected
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-danger/10 text-danger border border-danger/20'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-success animate-pulse' : 'bg-danger'
                }`}
              />
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <p className="text-sm text-zinc-secondary font-bold uppercase tracking-tight">
            Real-time auction monitoring and bid ticker
          </p>
        </div>

        {error && (
          <div className="px-3 py-2 rounded-xl bg-warning/10 border border-warning/20 text-warning text-xs font-bold">
            {error}
          </div>
        )}
      </div>

      {/* Live Stats Bar */}
      <LiveStatsBar stats={liveStats} isLoading={statsLoading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Ticker - 3 cols */}
        <div className="lg:col-span-3">
          {events.length === 0 && !isConnected ? (
            <TickerHistoryLoader />
          ) : (
            <GlobalBidTicker
              events={events}
              isConnected={isConnected}
              onClear={clearEvents}
            />
          )}
        </div>

        {/* Active Auctions - 2 cols */}
        <div className="lg:col-span-2">
          <ActiveAuctionsGrid />
        </div>
      </div>
    </div>
  );
};
