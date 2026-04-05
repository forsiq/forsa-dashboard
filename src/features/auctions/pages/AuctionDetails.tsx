import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Gavel, 
  Clock, 
  Users, 
  DollarSign, 
  ArrowLeft, 
  Heart, 
  Share2, 
  TrendingUp, 
  ShieldCheck,
  AlertCircle,
  History,
  Timer,
  ChevronRight,
  Eye,
  Activity,
  Calendar
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { useGetAuction, useGetAuctionBids, usePlaceBid } from '../graphql';

/**
 * AuctionDetails - Cinematic Asset Monitoring & Bidding Interface
 */
export const AuctionDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, dir } = useLanguage();
    const isRTL = dir === 'rtl';

    const auctionId = Number(id);
    const { data: auction, isLoading: auctionLoading } = useGetAuction(auctionId);
    const { data: bidsResponse, isLoading: bidsLoading } = useGetAuctionBids(auctionId);
    const bids = bidsResponse?.data || [];
    const placeBid = usePlaceBid();

    const [bidAmount, setBidAmount] = useState<string>('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Sync timer for precise countdowns
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handlePlaceBid = async () => {
        const amount = parseFloat(bidAmount);
        if (amount && amount > (auction?.currentBid || 0)) {
            try {
                await placeBid.mutateAsync({ auctionId, amount });
                setBidAmount('');
            } catch (err) {
                console.error('Bid rejection detected:', err);
            }
        }
    };

    const getCountdown = (endTimeStr: string) => {
        if (!endTimeStr) return 'TBD';
        const end = new Date(endTimeStr);
        const diff = end.getTime() - currentTime.getTime();
        
        if (diff <= 0) return 'TERMINATED';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) return `${days}d ${hours}h ${mins}m`;
        return `${hours}:${mins}:${secs < 10 ? '0' + secs : secs}`;
    };

    if (auctionLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-muted font-black uppercase tracking-[0.3em] italic animate-pulse">Scanning Asset Core...</p>
            </div>
        );
    }

    if (!auction) {
        return (
            <Card className="max-w-2xl mx-auto !p-12 text-center space-y-6 bg-obsidian-card border-danger/20">
                <AlertCircle className="w-16 h-16 text-danger mx-auto" />
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Node Desynchronization</h2>
                    <p className="text-zinc-muted font-bold uppercase tracking-tight text-sm">Requested asset identifier could not be located within the active matrix.</p>
                </div>
                <AmberButton onClick={() => navigate('/auctions')} variant="secondary" className="px-8 h-12 uppercase font-black italic">
                    Return to Infrastructure
                </AmberButton>
            </Card>
        );
    }

    const nextMinBid = (auction.currentBid || auction.startPrice) + auction.bidIncrement;
    const isEndingSoon = new Date(auction.endTime).getTime() - currentTime.getTime() < 1000 * 60 * 30; // 30 mins

    return (
        <div className="max-w-[1600px] mx-auto p-6 space-y-8 animate-in fade-in duration-700" dir={dir}>
            {/* Navigational Control & Status */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full">
                    <button 
                        onClick={() => navigate('/auctions')}
                        className="w-12 h-12 rounded-xl bg-obsidian-card border border-border flex items-center justify-center text-zinc-muted hover:text-brand hover:border-brand transition-all active:scale-95 shadow-lg"
                    >
                        <ArrowLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-brand uppercase tracking-widest italic">{auction.categoryName || 'GENERAL ASSET'}</span>
                            <div className="w-1 h-1 rounded-full bg-zinc-muted/30" />
                            <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Node ID: {auction.id}</span>
                        </div>
                        <h1 className="text-4xl font-black text-zinc-text tracking-tighter uppercase italic leading-none mt-1">{auction.title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <AmberButton 
                        variant="secondary" 
                        className="p-0 w-12 h-12 rounded-xl bg-obsidian-card border-border flex items-center justify-center hover:text-danger active:scale-95 transition-all"
                        onClick={() => {}}
                    >
                        <Heart className={cn("w-5 h-5", auction.isWatched && "fill-danger text-danger")} />
                    </AmberButton>
                    <AmberButton 
                        variant="secondary" 
                        className="p-0 w-12 h-12 rounded-xl bg-obsidian-card border-border flex items-center justify-center active:scale-95 transition-all"
                    >
                        <Share2 className="w-5 h-5 text-zinc-muted" />
                    </AmberButton>
                    <Link to={`/auctions/edit/${auction.id}`}>
                        <AmberButton className="h-12 bg-white text-black font-black uppercase tracking-widest italic rounded-xl px-8 hover:bg-zinc-200 active:scale-95 transition-all">
                            Modify Node
                        </AmberButton>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Telemetry & Narrative Coverage */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Primary Asset Visualizer */}
                    <Card className="!p-0 border-border bg-black overflow-hidden relative group aspect-video lg:aspect-auto h-[600px] shadow-2xl">
                         {auction.images?.[0] ? (
                             <img 
                                src={auction.images[0]} 
                                alt={auction.title} 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-1000" 
                             />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center">
                                 <Gavel className="w-32 h-32 text-zinc-muted/10" />
                             </div>
                         )}
                         {/* Visual Overlays */}
                         <div className="absolute top-6 left-6 flex items-center gap-3">
                             <StatusBadge 
                                status={auction.status.toUpperCase()} 
                                variant={auction.status === 'active' ? 'success' : 'warning'}
                                className="font-black tracking-[0.2em] italic border-none bg-black/60 backdrop-blur-xl px-4 py-2"
                             />
                             <div className="bg-black/60 backdrop-blur-xl border border-white/5 px-4 py-2 rounded-lg flex items-center gap-2">
                                 <Eye className="w-4 h-4 text-brand" />
                                 <span className="text-xs font-black text-white italic tracking-tighter">LIVE MONITORING</span>
                             </div>
                         </div>

                         <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/40 to-transparent">
                             <div className="flex items-end justify-between gap-6">
                                 <div className="space-y-4 max-w-2xl">
                                     <div className="flex items-center gap-3">
                                         <div className="w-12 h-1 bg-brand rounded-full" />
                                         <span className="text-xs font-black text-white uppercase tracking-[0.3em] italic">Physical Specification</span>
                                     </div>
                                     <h2 className="text-2xl font-black text-white italic uppercase tracking-tight leading-tight line-clamp-2">
                                         {auction.description}
                                     </h2>
                                 </div>
                                 <div className="hidden md:flex gap-2">
                                      {[1,2,3].map(i => (
                                          <div key={i} className="w-16 h-16 rounded-lg border border-white/10 bg-black/40 backdrop-blur-md cursor-pointer hover:border-brand transition-colors overflow-hidden shrink-0">
                                              <img src={auction.images?.[0] || ''} className="w-full h-full object-cover" />
                                          </div>
                                      ))}
                                 </div>
                             </div>
                         </div>
                    </Card>

                    {/* Operational Telemetry (Bid History) */}
                    <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-8">
                        <div className="flex items-center justify-between border-b border-white/[0.03] pb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                    <History className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">High-Frequency Telemetry</h3>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Total Cycles</span>
                                    <p className="text-xl font-black text-zinc-text italic leading-none mt-1">{auction.totalBids || 0}</p>
                                </div>
                                <div className="w-px h-8 bg-white/5" />
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Velocity Status</span>
                                    <p className="text-xl font-black text-emerald-400 italic leading-none mt-1 uppercase tracking-tighter">STABLE</p>
                                </div>
                            </div>
                        </div>

                        {bidsLoading ? (
                            <div className="space-y-4 py-8 text-center">
                                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-xs text-zinc-muted font-black uppercase italic tracking-widest">Parsing Transaction History...</p>
                            </div>
                        ) : bids?.length === 0 ? (
                            <div className="py-16 text-center space-y-4 bg-white/[0.02] rounded-2xl border border-dashed border-white/5">
                                <Activity className="w-12 h-12 text-zinc-muted/20 mx-auto" />
                                <p className="text-sm font-bold text-zinc-muted uppercase tracking-widest italic">No Bid Interactions Detected</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bids?.map((bid, index) => (
                                    <div 
                                        key={bid.id} 
                                        className={cn(
                                            "flex items-center justify-between p-5 rounded-2xl border transition-all hover:bg-white/[0.03]",
                                            index === 0 ? "bg-brand/5 border-brand/20 shadow-[0_0_20px_rgba(245,196,81,0.05)]" : "bg-obsidian-panel/40 border-white/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-full border flex items-center justify-center text-lg font-black italic",
                                                index === 0 ? "bg-brand text-black border-none" : "bg-obsidian-outer border-white/10 text-zinc-text"
                                            )}>
                                                {bid.bidderName?.[0] || 'A'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-zinc-text uppercase italic tracking-tight">{bid.bidderName || 'Anonymous Participant'}</span>
                                                    {index === 0 && <StatusBadge status="PREMIUM" variant="success" size="sm" className="h-4 text-[7px]" />}
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] font-black text-zinc-muted uppercase tracking-widest mt-1">
                                                    <Clock className="w-3 h-3" strokeWidth={3} />
                                                    {new Date(bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xl font-black text-zinc-text italic tracking-tighter tabular-nums">
                                                ${bid.amount.toLocaleString()}
                                            </span>
                                            <p className="text-[9px] font-black text-brand uppercase tracking-widest italic mt-0.5">Interaction Sequence #{bids.length - index}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Strategic Control Surface & Intelligence */}
                <div className="space-y-8">
                    {/* Tactical Bidding Logic */}
                    <Card className="!p-8 bg-obsidian-card border-border shadow-2xl relative overflow-hidden">
                        {/* Dynamic Background Effect */}
                        <div className={cn(
                            "absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-brand to-transparent transition-all duration-1000",
                            isEndingSoon ? "opacity-100" : "opacity-0"
                        )} />

                        <div className="space-y-8 relative">
                            {/* Value Telemetry */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] px-1 italic">Current Premium</span>
                                    <div className="flex items-baseline gap-1 text-brand">
                                        <span className="text-4xl font-black italic tabular-nums leading-none tracking-tighter italic">
                                            ${(auction.currentBid || auction.startPrice).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">Target Window</span>
                                    <div className={cn(
                                        "flex items-center justify-end gap-2 text-2xl font-black tabular-nums transition-colors duration-500 tracking-tighter leading-none italic",
                                        isEndingSoon ? "text-danger" : "text-warning"
                                    )}>
                                        <Timer className="w-5 h-5" />
                                        {getCountdown(auction.endTime)}
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-white/[0.03]" />

                            {/* Control Input Cluster */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                         <label className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Base Progression Layer</label>
                                         <span className="text-[9px] font-black text-zinc-muted uppercase italic tracking-tighter">Min Step: ${(auction.bidIncrement || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="relative group">
                                         <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-muted group-focus-within:text-brand transition-colors" />
                                         <AmberInput 
                                            type="number"
                                            placeholder={`Authorize ${nextMinBid.toLocaleString()} or above...`}
                                            className="h-14 bg-obsidian-outer border-border pl-12 pr-4 text-lg font-black tabular-nums italic placeholder:text-zinc-muted/30"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            disabled={auction.status !== 'active' || placeBid.isPending}
                                         />
                                    </div>
                                </div>

                                <AmberButton 
                                    className="w-full h-14 bg-brand hover:bg-brand text-black font-black uppercase tracking-[0.3em] italic rounded-2xl shadow-[0_10px_40px_rgba(245,196,81,0.1)] active:scale-95 transition-all text-sm relative group overflow-hidden gap-3"
                                    disabled={auction.status !== 'active' || placeBid.isPending || !bidAmount || parseFloat(bidAmount) < nextMinBid}
                                    onClick={handlePlaceBid}
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                    {placeBid.isPending && (
                                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    )}
                                    <span className="relative z-10">Authorize Bid Sequence</span>
                                </AmberButton>
                            </div>

                            {/* Secondary Actions */}
                            {auction.buyNowPrice && (
                                <AmberButton 
                                    variant="outline" 
                                    className="w-full h-12 border-emerald-500/20 text-emerald-400 font-black uppercase tracking-widest italic hover:bg-emerald-500/10 active:scale-95 transition-all"
                                >
                                    Instant Acquisition Protocol (${auction.buyNowPrice.toLocaleString()})
                                </AmberButton>
                            )}

                            {/* Integrity Verification */}
                            <div className="p-4 rounded-xl bg-obsidian-panel/40 border border-white/5 flex items-center gap-3">
                                 <ShieldCheck className="w-5 h-5 text-zinc-muted" />
                                 <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.1em] italic">End-to-End Encrypted Bidding Infrastructure</span>
                            </div>
                        </div>
                    </Card>

                    {/* Operational Node Info */}
                    <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                            <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">Infrastructure Logistics</h3>
                        </div>
                        
                        <div className="space-y-5">
                             <div className="flex items-center justify-between group">
                                 <div className="flex items-center gap-3">
                                     <Calendar className="w-4 h-4 text-zinc-muted group-hover:text-brand transition-colors" />
                                     <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Temporal Start</span>
                                 </div>
                                 <span className="text-xs font-black text-zinc-text uppercase italic tracking-tight">{new Date(auction.startTime).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between group">
                                 <div className="flex items-center gap-3">
                                     <Clock className="w-4 h-4 text-zinc-muted group-hover:text-brand transition-colors" />
                                     <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Node Termination</span>
                                 </div>
                                 <span className="text-xs font-black text-zinc-text uppercase italic tracking-tight">{new Date(auction.endTime).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between group">
                                 <div className="flex items-center gap-3">
                                     <TrendingUp className="w-4 h-4 text-zinc-muted group-hover:text-brand transition-colors" />
                                     <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Progression Delta</span>
                                 </div>
                                 <span className="text-xs font-black text-zinc-text uppercase italic tracking-tight">${(auction.bidIncrement || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between group">
                                 <div className="flex items-center gap-3">
                                     <Users className="w-4 h-4 text-zinc-muted group-hover:text-brand transition-colors" />
                                     <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Asset Custodian</span>
                                 </div>
                                 <span className="text-xs font-black text-zinc-text uppercase italic tracking-tight">{auction.winnerName || 'Strategic Division 11'}</span>
                            </div>
                        </div>

                        <div className="pt-4">
                            <AmberButton variant="secondary" className="w-full gap-2 font-black uppercase italic tracking-widest text-[10px] h-10 bg-obsidian-panel border-border active:scale-95 transition-all">
                                 Download Asset Manifest
                            </AmberButton>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AuctionDetails;
