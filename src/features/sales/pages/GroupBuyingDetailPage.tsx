import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Users, 
  Clock, 
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
  Calendar,
  Zap,
  Target,
  Package,
  CheckCircle2,
  Lock,
  Unlock
} from 'lucide-react';
import { useLanguage } from '@core/contexts/LanguageContext';
import { cn } from '@core/lib/utils/cn';
import { AmberCard as Card } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberProgress } from '@core/components/AmberProgress';
import { StatusBadge } from '@core/components/Data/StatusBadge';
import { 
  useGetGroupBuying, 
  useGetGroupBuyingParticipants,
  useJoinGroupBuying
} from '../api';


/**
 * GroupBuyingDetailPage - Cinematic Campaign Monitoring & Participation Interface
 */
export const GroupBuyingDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, dir } = useLanguage();
    const isRTL = dir === 'rtl';

    const campaignId = id || '';
    const { data: campaign, isLoading: campaignLoading } = useGetGroupBuying(campaignId, true);
    const { data: participantsData, isLoading: participantsLoading } = useGetGroupBuyingParticipants(campaignId);
    const joinMutation = useJoinGroupBuying();

    const [currentTime, setCurrentTime] = useState(new Date());

    // Sync timer for precise countdowns
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleJoin = async () => {
        try {
            await joinMutation.mutateAsync({ id: campaignId, quantity: 1 });

        } catch (err) {
            console.error('Participation rejection:', err);
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

    if (campaignLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-muted font-black uppercase tracking-[0.3em] italic animate-pulse">Scanning Campaign Node...</p>
            </div>
        );
    }

    if (!campaign) {
        return (
            <Card className="max-w-2xl mx-auto !p-12 text-center space-y-6 bg-obsidian-card border-danger/20">
                <AlertCircle className="w-16 h-16 text-danger mx-auto" />
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Node Desynchronization</h2>
                    <p className="text-zinc-muted font-bold uppercase tracking-tight text-sm">Requested campaign protocol could not be located within the active matrix.</p>
                </div>
                <AmberButton onClick={() => navigate('/group-buying')} variant="secondary" className="px-8 h-12 uppercase font-black italic">
                    {t('common.back')}
                </AmberButton>
            </Card>
        );
    }

    const participants = participantsData?.participants || [];
    const progress = (campaign.currentParticipants / campaign.maxParticipants) * 100;
    const isUnlocked = campaign.currentParticipants >= campaign.minParticipants;
    const isEndingSoon = new Date(campaign.endTime).getTime() - currentTime.getTime() < 1000 * 60 * 60 * 24; // 24 hours

    return (
        <div className="max-w-[1600px] mx-auto p-6 space-y-8 animate-in fade-in duration-700" dir={dir}>
            {/* Navigational Control & Status */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 w-full">
                    <button 
                        onClick={() => navigate('/group-buying')}
                        className="w-12 h-12 rounded-xl bg-obsidian-card border border-border flex items-center justify-center text-zinc-muted hover:text-brand hover:border-brand transition-all active:scale-95 shadow-lg"
                    >
                        <ArrowLeft className={cn("w-5 h-5", isRTL && "rotate-180")} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-brand uppercase tracking-widest italic">{campaign.category?.name || 'GENERAL COLLABORATION'}</span>
                            <div className="w-1 h-1 rounded-full bg-zinc-muted/30" />
                            <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Protocol Node: {campaign.id}</span>
                        </div>
                        <h1 className="text-4xl font-black text-zinc-text tracking-tighter uppercase italic leading-none mt-1">{campaign.title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <AmberButton 
                        variant="secondary" 
                        className="p-0 w-12 h-12 rounded-xl bg-obsidian-card border-border flex items-center justify-center active:scale-95 transition-all text-zinc-muted"
                    >
                        <Share2 className="w-5 h-5" />
                    </AmberButton>
                    <Link to={`/group-buying/${campaign.id}/edit`}>
                        <AmberButton className="h-12 bg-white text-black font-black uppercase tracking-widest italic rounded-xl px-8 hover:bg-zinc-200 active:scale-95 transition-all shadow-xl">
                            {t('common.edit')}
                        </AmberButton>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Telemetry & Operational Flow */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Primary Asset Visualizer */}
                    <Card className="!p-0 border-border bg-black overflow-hidden relative group h-[500px] shadow-2xl rounded-3xl">
                         {campaign.item?.images?.[0] ? (
                             <img 
                                src={campaign.item.images[0]} 
                                alt={campaign.title} 
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-1000" 
                             />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center">
                                 <Users className="w-32 h-32 text-zinc-muted/10" />
                             </div>
                         )}

                         {/* High-Level Overlays */}
                         <div className="absolute top-8 left-8 flex items-center gap-4">
                             <StatusBadge 
                                status={campaign.status.toUpperCase()} 
                                variant={campaign.status === 'active' ? 'active' : 'warning'}
                                className="font-black tracking-[0.2em] italic border-none bg-black/60 backdrop-blur-xl px-5 py-2.5 shadow-2xl"
                             />
                             <div className="bg-black/60 backdrop-blur-xl border border-white/5 px-5 py-2.5 rounded-xl flex items-center gap-3 shadow-2xl">
                                 {isUnlocked ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-warning" />}
                                 <span className={cn(
                                     "text-xs font-black italic tracking-tighter",
                                     isUnlocked ? "text-emerald-400" : "text-warning"
                                 )}>
                                     {isUnlocked ? 'THRESHOLD UNLOCKED' : 'SYNCHRONIZATION PENDING'}
                                 </span>
                             </div>
                         </div>

                         <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black via-black/40 to-transparent">
                             <div className="space-y-4 max-w-3xl">
                                 <div className="flex items-center gap-3">
                                     <div className="w-12 h-1 bg-brand rounded-full" />
                                     <span className="text-xs font-black text-white uppercase tracking-[0.3em] italic">Operational Asset narrative</span>
                                 </div>
                                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tight leading-tight line-clamp-2">
                                     {campaign.description}
                                 </h2>
                             </div>
                         </div>
                    </Card>

                    {/* Participation Matrix (Milestones) */}
                    <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-10">
                        <div className="flex items-center justify-between border-b border-white/[0.03] pb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-inner">
                                    <Target className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">Campaign reach synchronization</h3>
                            </div>
                            <div className="flex items-center gap-8 text-right">
                                <div>
                                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Current Node Reach</span>
                                    <p className="text-2xl font-black text-zinc-text italic tracking-tighter leading-none mt-1">{campaign.currentParticipants}</p>
                                </div>
                                <div className="w-px h-10 bg-white/5" />
                                <div>
                                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Target Threshold</span>
                                    <p className="text-2xl font-black text-brand italic tracking-tighter leading-none mt-1">{campaign.maxParticipants}</p>
                                </div>
                            </div>
                        </div>

                        {/* Visual Milestone Progress */}
                        <div className="relative pt-4 pb-8 px-4">
                             <AmberProgress 
                                value={progress} 
                                variant={isUnlocked ? 'success' : 'primary'} 
                                className="h-4 bg-white/[0.03] rounded-full border border-white/5 shadow-inner" 
                             />
                             
                             {/* Tactical Milestone Markers */}
                             <div className="absolute inset-x-4 top-2 bottom-6 pointer-events-none">
                                 {/* Startup Marker */}
                                 <div className="absolute left-0 -translate-x-1/2 flex flex-col items-center gap-2">
                                     <div className="w-1 h-8 bg-white/20" />
                                     <span className="text-[8px] font-black text-zinc-muted uppercase bg-black px-2 py-1 border border-white/10 rounded-md">INITIALIZE</span>
                                 </div>
                                 
                                 {/* Activation Threshold */}
                                 <div 
                                    className="absolute -translate-x-1/2 flex flex-col items-center gap-2"
                                    style={{ left: `${(campaign.minParticipants / campaign.maxParticipants) * 100}%` }}
                                 >
                                     <div className={cn("w-1 h-8 transition-colors duration-500", isUnlocked ? "bg-emerald-500" : "bg-warning/40")} />
                                     <span className={cn(
                                         "text-[8px] font-black uppercase px-2 py-1 border rounded-md transition-all",
                                         isUnlocked ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-black text-zinc-muted border-white/10"
                                     )}>ACTIVATION</span>
                                 </div>

                                 {/* Final Resolution */}
                                 <div className="absolute right-0 translate-x-1/2 flex flex-col items-center gap-2">
                                     <div className="w-1 h-8 bg-zinc-muted/20" />
                                     <span className="text-[8px] font-black text-zinc-muted uppercase bg-black px-2 py-1 border border-white/10 rounded-md">RESOLUTION</span>
                                 </div>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                                <div className="flex items-center gap-2 opacity-60">
                                    <Users className="w-4 h-4 text-brand" />
                                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Core nodes</span>
                                </div>
                                <p className="text-xl font-black text-zinc-text italic tracking-tighter uppercase tabular-nums">{campaign.currentParticipants} Joined</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                                <div className="flex items-center gap-2 opacity-60">
                                    <Zap className="w-4 h-4 text-emerald-400" />
                                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Minimum Reach</span>
                                </div>
                                <p className="text-xl font-black text-zinc-text italic tracking-tighter uppercase tabular-nums">{campaign.minParticipants} Required</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                                <div className="flex items-center gap-2 opacity-60">
                                    <Activity className="w-4 h-4 text-info" />
                                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Capacity Cap</span>
                                </div>
                                <p className="text-xl font-black text-zinc-text italic tracking-tighter uppercase tabular-nums">{campaign.maxParticipants} Max</p>
                            </div>
                        </div>
                    </Card>

                    {/* High-Resolution Participation Log */}
                    <Card className="!p-8 bg-obsidian-card border-border shadow-2xl space-y-8">
                         <div className="flex items-center justify-between border-b border-white/[0.03] pb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                                    <History className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">Campaign Interaction sequence</h3>
                            </div>
                        </div>

                        {participantsLoading ? (
                             <div className="space-y-4 py-8 text-center animate-pulse">
                                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-xs text-zinc-muted font-black uppercase italic tracking-widest">Parsing node interactions...</p>
                            </div>
                        ) : participants.length === 0 ? (
                            <div className="py-20 text-center space-y-5 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                                <Users className="w-12 h-12 text-zinc-muted/20 mx-auto" />
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-zinc-muted uppercase tracking-[0.2em] italic">No active nodes detected</p>
                                    <p className="text-[10px] text-zinc-muted/50 font-bold uppercase">Initialize the sequence to commence asset acquisition</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {participants.map((p, idx) => (
                                    <div key={p.id} className="flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-obsidian-panel/40 hover:bg-white/[0.03] transition-all group">
                                         <div className="flex items-center gap-4">
                                             <div className="w-12 h-12 rounded-full bg-obsidian-outer border border-white/10 flex items-center justify-center text-lg font-black text-zinc-text italic group-hover:border-brand transition-colors shadow-inner">
                                                 {p.userName?.[0] || 'U'}
                                             </div>
                                             <div>
                                                 <div className="flex items-center gap-2">
                                                     <p className="text-sm font-black text-zinc-text uppercase italic tracking-tight">{p.userName || 'Anonymous Participant'}</p>
                                                     <StatusBadge status="VERIFIED NODE" variant="success" size="sm" className="h-4 text-[7px] tracking-widest px-2" />
                                                 </div>
                                                 <div className="flex items-center gap-2 text-[9px] font-black text-zinc-muted uppercase tracking-widest mt-1">
                                                     <Clock className="w-3 h-3" strokeWidth={3} />
                                                     {new Date(p.joinedAt).toLocaleString()}
                                                 </div>
                                             </div>
                                         </div>
                                         <div className="text-right">
                                             <div className="flex items-center gap-2 justify-end mb-1">
                                                 <Package className="w-3.5 h-3.5 text-brand" />
                                                 <span className="text-sm font-black text-zinc-text italic tabular-nums tracking-tighter italic">x{p.quantity} Unit Allocation</span>
                                             </div>
                                             <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic mt-0.5">Sequence Hash Verification Confirmed</p>
                                         </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Tactical Control Surface & Bidding Analytics */}
                <div className="space-y-8">
                     {/* Bidding Control Panel */}
                    <Card className="!p-8 bg-obsidian-card border-border shadow-2xl relative overflow-hidden group">
                        {/* Dynamic Activation Effect */}
                        <div className={cn(
                            "absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-brand to-transparent transition-all duration-1000",
                            isEndingSoon ? "opacity-100" : "opacity-0"
                        )} />

                        <div className="space-y-8 relative">
                            {/* Value Matrix */}
                            <div className="grid grid-cols-2 gap-6 pb-2 border-b border-white/[0.03]">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] italic font-bold">Deal Allocation</span>
                                    <p className="text-4xl font-black text-brand italic tabular-nums leading-none tracking-tighter italic mt-1">
                                        ${campaign.dealPrice.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right space-y-1">
                                    <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] italic font-bold">Standard Value</span>
                                    <p className="text-xl font-bold text-zinc-muted italic line-through tabular-nums leading-none tracking-tighter mt-1">
                                        ${campaign.originalPrice.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between text-warning">
                                    <div className="flex items-center gap-2">
                                        <Timer className="w-5 h-5 shadow-sm" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Campaign Horizon</span>
                                    </div>
                                    <span className={cn(
                                        "text-2xl font-black tabular-nums tracking-tighter leading-none italic",
                                        isEndingSoon ? "text-danger animate-pulse" : "text-warning"
                                    )}>
                                        {getCountdown(campaign.endTime)}
                                    </span>
                                </div>

                                <div className="h-px bg-white/[0.05]" />

                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 shadow-inner">
                                     <div className="flex items-center justify-between">
                                         <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest italic">Acquisition Advantage</span>
                                         <StatusBadge status="HIGH YIELD" variant="success" size="sm" className="h-4 text-[7px]" />
                                     </div>
                                     <div className="flex items-baseline gap-2">
                                         <TrendingUp className="w-4 h-4 text-emerald-400" />
                                         <span className="text-2xl font-black text-zinc-text italic tracking-tighter tabular-nums leading-none whitespace-nowrap">
                                             SAVE ${(campaign.originalPrice - campaign.dealPrice).toLocaleString()} PER NODE
                                         </span>
                                     </div>
                                </div>

                                <AmberButton 
                                    className="w-full h-16 bg-brand hover:bg-brand text-black font-black uppercase tracking-[0.3em] italic rounded-[2rem] shadow-[0_15px_40px_rgba(245,196,81,0.15)] active:scale-95 transition-all text-sm relative group overflow-hidden"
                                    disabled={campaign.status !== 'active' || joinMutation.isPending || (campaign.maxParticipants > 0 && campaign.currentParticipants >= campaign.maxParticipants)}
                                    onClick={handleJoin}
                                >
                                     <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                     {joinMutation.isPending ? (
                                         <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                                     ) : (
                                         <span className="relative z-10 group-hover:tracking-[0.4em] transition-all duration-500">Authorize Allocation</span>
                                     )}
                                </AmberButton>
                            </div>

                            {/* Trust Indicator */}
                            <div className="p-4 rounded-xl bg-obsidian-panel/60 border border-white/5 flex items-center gap-3 shadow-inner">
                                 <ShieldCheck className="w-5 h-5 text-zinc-muted" />
                                 <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.1em] italic">Collective Consensus and Escrow Protection Enabled</span>
                            </div>
                        </div>
                    </Card>

                    {/* Operational Logistics Node */}
                    <Card className="!p-8 bg-obsidian-card border-border shadow-xl space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/[0.03] pb-6">
                            <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.25em] italic">Deployment Specifications</h3>
                        </div>
                        
                        <div className="space-y-6">
                            {[
                                { label: 'Node Initialization', value: new Date(campaign.startTime).toLocaleString(), icon: Calendar },
                                { label: 'Temporal Termination', value: new Date(campaign.endTime).toLocaleString(), icon: Clock },
                                { label: 'Asset Identifier', value: `ZVB-${campaign.productId || 'GEN'}`, icon: Package },
                                { label: 'Protocol Controller', value: 'Asset Management Div 11', icon: ShieldCheck },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                     <div className="flex items-center gap-4">
                                         <item.icon className="w-4 h-4 text-zinc-muted group-hover:text-brand transition-colors" />
                                         <span className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.2em] italic">{item.label}</span>
                                     </div>
                                     <span className="text-xs font-black text-zinc-text uppercase italic tracking-tight">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <AmberButton variant="secondary" className="w-full gap-2 font-black uppercase italic tracking-widest text-[10px] h-12 bg-obsidian-panel border-border active:scale-95 transition-all rounded-xl shadow-md">
                                 Generate Deployment Manifest
                            </AmberButton>
                        </div>
                    </Card>

                    {/* Operational Alert Cluster */}
                    {!isUnlocked && (
                        <div className="p-6 rounded-3xl bg-warning/5 border border-warning/10 space-y-4 animate-pulse shadow-inner">
                            <div className="flex items-center gap-3 text-warning">
                                <AlertCircle className="w-5 h-5" />
                                <h4 className="text-xs font-black uppercase tracking-widest italic">Activation Threshold Pending</h4>
                            </div>
                            <p className="text-[11px] text-warning/80 font-bold uppercase tracking-tight leading-relaxed">
                                Current campaign reach is below synchronization target. Successful asset acquisition requires activation of {campaign.minParticipants - campaign.currentParticipants} more nodes.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupBuyingDetailPage;
