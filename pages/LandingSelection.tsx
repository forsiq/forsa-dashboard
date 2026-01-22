
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AmberLogo } from '../amber-ui/components/AmberLogo';
import { AmberCard } from '../amber-ui/components/AmberCard';
import { useNavigation, AppMode } from '../amber-ui/contexts/NavigationContext';
import { 
  LayoutGrid, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Hexagon,
  Info
} from 'lucide-react';
import { cn } from '../lib/cn';

export const LandingSelection = () => {
  const navigate = useNavigate();
  const { switchMode } = useNavigation();

  const handleSelection = (mode: AppMode, path: string) => {
    switchMode(mode);
    navigate(path);
  };

  const options = [
    {
      id: 'generic' as AppMode,
      title: 'General Operations',
      subtitle: 'Day-to-day Management',
      icon: LayoutGrid,
      path: '/dashboard',
      color: 'text-brand',
      bg: 'group-hover:bg-brand/10',
      border: 'group-hover:border-brand/30',
      desc: 'Access dashboards, product catalog, inventory, and order processing.'
    },
    {
      id: 'portal' as AppMode,
      title: 'Service Portal',
      subtitle: 'Blueprints & Hubs',
      icon: Layers,
      path: '/portal',
      color: 'text-info',
      bg: 'group-hover:bg-info/10',
      border: 'group-hover:border-info/30',
      desc: 'Access the service directory, automation templates, and resource views.'
    },
    {
      id: 'admin' as AppMode,
      title: 'Administration',
      subtitle: 'System Control',
      icon: ShieldCheck,
      path: '/admin/users',
      color: 'text-success',
      bg: 'group-hover:bg-success/10',
      border: 'group-hover:border-success/30',
      desc: 'Manage users, permissions, infrastructure, and security settings.'
    }
  ];

  return (
    <div className="min-h-screen bg-obsidian-outer flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-brand/5 via-obsidian-outer to-obsidian-outer pointer-events-none" />
      
      {/* Public Header */}
      <header className="relative z-20 w-full px-6 py-5 flex items-center justify-between border-b border-white/5 bg-obsidian-outer/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <AmberLogo className="w-8 h-8" />
          <span className="text-lg font-black text-zinc-text uppercase italic tracking-tighter hidden sm:block">ZoneVast</span>
        </div>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link to="/about" className="text-[10px] font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest transition-colors flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> About
          </Link>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <Link to="/login" className="text-[10px] font-black text-zinc-text hover:text-brand uppercase tracking-widest transition-colors">
            Login
          </Link>
          <Link to="/signup" className="px-4 py-2 bg-brand text-obsidian-outer rounded-sm text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-brand/10">
            Sign Up
          </Link>
        </nav>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 animate-fade-up">
        <div className="max-w-6xl w-full space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-zinc-text tracking-tighter uppercase italic leading-none">
                ZoneVast <span className="text-brand">Enterprise</span>
              </h1>
              <p className="text-xs md:text-sm font-bold text-zinc-muted uppercase tracking-[0.4em] mt-6 max-w-2xl mx-auto leading-relaxed">
                Distributed Service Orchestration Platform for High-Velocity Teams
              </p>
            </div>
          </div>

          {/* Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelection(opt.id, opt.path)}
                className="group text-left h-full"
              >
                <AmberCard className={cn(
                  "h-full p-8 flex flex-col transition-all duration-300 border-white/5 bg-obsidian-panel/50 hover:-translate-y-2 hover:shadow-2xl",
                  opt.border
                )} glass>
                  <div className="flex items-center justify-between mb-8">
                    <div className={cn(
                      "w-16 h-16 rounded-xl border border-white/5 flex items-center justify-center transition-colors duration-300",
                      "bg-obsidian-outer",
                      opt.bg,
                      opt.color
                    )}>
                      <opt.icon className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div className={cn(
                      "w-10 h-10 rounded-full border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-4 group-hover:translate-x-0 bg-obsidian-outer",
                      opt.color
                    )}>
                      <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    <div>
                      <h2 className="text-xl font-black text-zinc-text uppercase italic tracking-tight group-hover:text-white transition-colors">
                        {opt.title}
                      </h2>
                      <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mt-1", opt.color)}>
                        {opt.subtitle}
                      </p>
                    </div>
                    <p className="text-xs font-medium text-zinc-secondary leading-relaxed pt-2">
                      {opt.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2 text-[9px] font-black text-zinc-muted uppercase tracking-widest group-hover:text-zinc-text transition-colors">
                    <Hexagon className={cn("w-3 h-3 fill-current", opt.color)} />
                    <span>Secure Environment</span>
                  </div>
                </AmberCard>
              </button>
            ))}
          </div>

          {/* Footer Info */}
          <div className="text-center pt-8 border-t border-white/5">
            <p className="text-[10px] text-zinc-muted font-bold uppercase tracking-[0.3em] opacity-40">
              System Version v4.12.8 • Connected via Secure Node
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
