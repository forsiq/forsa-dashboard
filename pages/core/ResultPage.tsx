
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  ArrowRight, 
  RotateCcw, 
  Copy,
  Printer,
  Home
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { AmberCard } from '../../amber-ui/components/AmberCard';
import { AmberButton } from '../../amber-ui/components/AmberButton';

type ResultType = 'success' | 'error' | 'warning' | 'info';

interface ResultLocationState {
  type?: ResultType;
  title?: string;
  description?: string;
  actionPrimary?: { label: string; path: string };
  actionSecondary?: { label: string; path: string; icon?: string };
  meta?: { label: string; value: string }[];
}

export const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Default values if no state provided (Preview Mode)
  const state = (location.state as ResultLocationState) || {
    type: 'success',
    title: 'Operation Completed',
    description: 'The requested action was executed successfully. All system nodes have been synchronized.',
    actionPrimary: { label: 'Return to Dashboard', path: '/' },
    meta: [
      { label: 'Transaction ID', value: 'TXN-8821-X' },
      { label: 'Timestamp', value: new Date().toLocaleString() }
    ]
  };

  const { type, title, description, actionPrimary, actionSecondary, meta } = state;

  const getConfig = (t: ResultType) => {
    switch(t) {
      case 'success': return { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/5', border: 'border-success/20', ring: 'ring-success/10' };
      case 'error': return { icon: XCircle, color: 'text-danger', bg: 'bg-danger/5', border: 'border-danger/20', ring: 'ring-danger/10' };
      case 'warning': return { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/5', border: 'border-warning/20', ring: 'ring-warning/10' };
      default: return { icon: Info, color: 'text-info', bg: 'bg-info/5', border: 'border-info/20', ring: 'ring-info/10' };
    }
  };

  const config = getConfig(type || 'success');
  const Icon = config.icon;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 animate-fade-up">
      <AmberCard className={cn("max-w-lg w-full p-8 text-center border-t-4", config.bg, config.border)} style={{ borderTopColor: 'currentColor' }}>
        
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={cn("w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl", config.bg, config.border, config.color)}>
            <Icon className="w-10 h-10" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter mb-3">
          {title}
        </h1>
        <p className="text-sm font-medium text-zinc-secondary leading-relaxed mb-8">
          {description}
        </p>

        {/* Meta Data */}
        {meta && meta.length > 0 && (
          <div className="bg-obsidian-panel border border-white/5 rounded-sm p-4 mb-8 text-left space-y-2">
             {meta.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                   <span className="font-bold text-zinc-muted uppercase tracking-wider text-[10px]">{item.label}</span>
                   <span className="font-mono text-zinc-text">{item.value}</span>
                </div>
             ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {actionSecondary && (
             <AmberButton 
               variant="secondary" 
               onClick={() => navigate(actionSecondary.path)}
               className="justify-center"
             >
               {actionSecondary.label}
             </AmberButton>
          )}
          
          {actionPrimary ? (
             <AmberButton 
               onClick={() => navigate(actionPrimary.path)} 
               className={cn("justify-center", type === 'error' ? "bg-danger hover:bg-danger/90 border-transparent text-white" : "bg-brand text-obsidian-outer")}
             >
               {actionPrimary.label} <ArrowRight className="w-4 h-4 ml-2" />
             </AmberButton>
          ) : (
             <AmberButton onClick={() => navigate('/')} className="justify-center">
                Return Home
             </AmberButton>
          )}
        </div>

        {/* Utility Links */}
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-center gap-6 text-[10px] font-bold text-zinc-muted uppercase tracking-widest">
           <button className="hover:text-zinc-text flex items-center gap-1 transition-colors"><Printer className="w-3 h-3" /> Print Receipt</button>
           <button className="hover:text-zinc-text flex items-center gap-1 transition-colors"><Copy className="w-3 h-3" /> Copy ID</button>
        </div>
      </AmberCard>
    </div>
  );
};
