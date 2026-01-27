
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AmberLogo } from '../../amber-ui/components/AmberLogo';
import { ArrowLeft, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/cn';

export const LoadingScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Initializing core kernel...');
  const [isComplete, setIsComplete] = useState(false);

  // Simulation steps
  const steps = [
    { pct: 15, msg: 'Handshaking with satellite nodes...' },
    { pct: 30, msg: 'Validating encryption tokens...' },
    { pct: 45, msg: 'Hydrating data cache (42MB)...' },
    { pct: 60, msg: 'Syncing with US-East cluster...' },
    { pct: 80, msg: 'Optimizing layout engine...' },
    { pct: 95, msg: 'Finalizing secure connection...' },
    { pct: 100, msg: 'System Ready.' }
  ];

  useEffect(() => {
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setIsComplete(true);
        return;
      }
      
      const { pct, msg } = steps[currentStep];
      setProgress(pct);
      setStage(msg);
      currentStep++;
      
    }, 800); // Step duration

    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    setProgress(0);
    setIsComplete(false);
    setStage('Re-initializing...');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-obsidian-outer flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-12">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-6">
           <div className={cn("relative transition-all duration-1000", isComplete ? "scale-100" : "scale-110 animate-pulse")}>
              <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full" />
              <AmberLogo className="w-20 h-20 relative z-10 drop-shadow-2xl" />
           </div>
           
           <div className="space-y-2">
              <h1 className="text-3xl font-black text-zinc-text tracking-tighter uppercase italic">
                 ZoneVast <span className="text-brand">Enterprise</span>
              </h1>
              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-muted uppercase tracking-[0.3em]">
                 <span>v4.12.8</span>
                 <span className="w-1 h-1 bg-zinc-muted rounded-full" />
                 <span>Secure Mode</span>
              </div>
           </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-4">
           {/* Bar */}
           <div className="h-1.5 w-full bg-obsidian-panel border border-white/10 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-brand shadow-[0_0_10px_rgba(255,192,0,0.5)] transition-all duration-700 ease-out" 
                style={{ width: `${progress}%` }}
              />
           </div>
           
           {/* Text Feedback */}
           <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest h-6">
              <span className={cn("transition-colors", isComplete ? "text-success" : "text-zinc-text")}>
                 {stage}
              </span>
              <span className="text-zinc-muted">{progress}%</span>
           </div>
        </div>

        {/* Actions (Only when complete) */}
        <div className={cn("transition-all duration-700 flex justify-center gap-4", isComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")}>
           <button 
             onClick={() => navigate('/')}
             className="flex items-center gap-2 px-8 py-3 bg-brand text-obsidian-outer rounded-sm text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-brand/10"
           >
              Enter Dashboard
           </button>
           <button 
             onClick={handleReset}
             className="p-3 bg-white/5 border border-white/10 rounded-sm text-zinc-muted hover:text-zinc-text transition-all"
             title="Restart Sequence"
           >
              <RefreshCw className="w-4 h-4" />
           </button>
        </div>

        {/* Console Log Decoration */}
        <div className="absolute bottom-[-100px] left-0 right-0 opacity-20 pointer-events-none text-[8px] font-mono text-left space-y-1 text-zinc-muted hidden md:block">
           <p>{'>'} [SYS] Mounting virtual DOM...</p>
           <p>{'>'} [NET] 14ms latency to primary node</p>
           <p>{'>'} [SEC] AES-256 handshake verified</p>
        </div>

      </div>

      {/* Manual Exit if stuck (Top Left) */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-[10px] font-bold text-zinc-muted hover:text-zinc-text uppercase tracking-widest transition-colors z-50"
      >
         <ArrowLeft className="w-3.5 h-3.5" /> Cancel
      </button>
    </div>
  );
};
