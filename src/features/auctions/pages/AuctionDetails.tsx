/**
 * Auction Details Page
 *
 * Shows full auction information with bid history
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Clock, Users, DollarSign } from 'lucide-react';
import { useAuction, useAuctionBids, usePlaceBid, useToggleWatch } from '../hooks/useAuctions';

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

export const AuctionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState('');

  const auctionId = parseInt(id || '0');
  const { data: auction, isLoading } = useAuction(auctionId);
  const { data: bids } = useAuctionBids(auctionId);
  const placeBid = usePlaceBid();
  const toggleWatch = useToggleWatch();

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    if (amount && amount > (auction?.currentBid || 0)) {
      placeBid.mutate(
        { auctionId, amount },
        {
          onSuccess: () => setBidAmount(''),
        }
      );
    }
  };

  const handleToggleWatch = () => {
    toggleWatch.mutate(auctionId);
  };

  const getNextMinBid = () => {
    if (!auction) return 0;
    return auction.currentBid + auction.bidIncrement;
  };

  const getTimeRemaining = () => {
    if (!auction) return '';
    const endTime = new Date(auction.endTime).getTime();
    const now = Date.now();
    const diff = endTime - now;

    if (diff <= 0) return 'Auction ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading auction...</div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Auction not found</div>
      </div>
    );
  }

  const canBid = auction.status === 'active';
  const nextMinBid = getNextMinBid();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="p-2 hover:bg-white/5"
          onClick={() => navigate('/auctions')}
        >
          <ArrowLeft size={20} className="text-white" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{auction.title}</h1>
          <p className="text-zinc-400 mt-1">
            {auction.categoryName || 'General'} · {auction.status}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="p-2 hover:bg-white/5"
            onClick={handleToggleWatch}
          >
            <Heart
              size={20}
              className={auction.isWatched ? 'text-red-500 fill-red-500' : 'text-zinc-400'}
            />
          </Button>
          <Button variant="ghost" className="p-2 hover:bg-white/5">
            <Share2 size={20} className="text-zinc-400" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Images */}
          {auction.images[0] && (
            <Card className="overflow-hidden">
              <img
                src={auction.images[0]}
                alt={auction.title}
                className="w-full h-80 object-cover"
              />
            </Card>
          )}

          {/* Description */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
            <p className="text-zinc-300 whitespace-pre-wrap">{auction.description}</p>
          </Card>

          {/* Bid History */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Bid History</h2>
            {bids && bids.length > 0 ? (
              <div className="space-y-3">
                {bids.map((bid, index) => (
                  <div
                    key={bid.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0 ? 'bg-brand/20' : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                        {bid.bidderName?.[0] || '?'}
                      </div>
                      <div>
                        <div className="text-white font-medium">{bid.bidderName || 'Anonymous'}</div>
                        <div className="text-xs text-zinc-500">
                          {new Date(bid.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">${bid.amount.toLocaleString()}</div>
                      {bid.isAutoBid && (
                        <div className="text-xs text-zinc-500">Auto-bid</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-zinc-500 py-8">No bids yet</div>
            )}
          </Card>
        </div>

        {/* Right Column - Bidding Panel */}
        <div className="space-y-4">
          {/* Current Price Card */}
          <Card className="p-6 space-y-4">
            <div>
              <div className="text-zinc-400 text-sm">Current Bid</div>
              <div className="text-3xl font-bold text-white">
                ${auction.currentBid.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-zinc-400">
                <Users size={16} />
                <span>{auction.totalBids} bids</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-400">
                <Clock size={16} />
                <span>{getTimeRemaining()}</span>
              </div>
            </div>

            {canBid && (
              <>
                <div className="border-t border-white/10 pt-4">
                  <div className="text-zinc-400 text-sm mb-2">
                    Minimum next bid: <span className="text-white">${nextMinBid.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="number"
                        min={nextMinBid}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Enter ${nextMinBid} or more`}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                    <Button
                      onClick={handlePlaceBid}
                      disabled={placeBid.isPending || !bidAmount || parseFloat(bidAmount) < nextMinBid}
                      className="bg-brand hover:bg-brand/90 text-white px-6"
                    >
                      Place Bid
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="autobid" className="rounded bg-zinc-800" />
                  <label htmlFor="autobid" className="text-sm text-zinc-400">
                    Use auto-bid up to: $
                    <input
                      type="number"
                      className="w-20 bg-transparent border-b border-white/10 focus:outline-none focus:border-brand"
                      placeholder="Max amount"
                    />
                  </label>
                </div>
              </>
            )}

            {auction.status === 'ended' && auction.winnerId && (
              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-zinc-400">Winner</div>
                <div className="text-white font-medium">{auction.winnerName || 'Anonymous'}</div>
              </div>
            )}
          </Card>

          {/* Auction Info */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Started</span>
              <span className="text-white">
                {new Date(auction.startTime).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Ends</span>
              <span className="text-white">{new Date(auction.endTime).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Bid Increment</span>
              <span className="text-white">${auction.bidIncrement}</span>
            </div>
            {auction.reservePrice && (
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Reserve Price</span>
                <span className="text-white">${auction.reservePrice.toLocaleString()}</span>
              </div>
            )}
            {auction.buyNowPrice && (
              <Button className="w-full bg-emerald-600 hover:bg-emerald-600/90 text-white">
                Buy Now for ${auction.buyNowPrice.toLocaleString()}
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;
