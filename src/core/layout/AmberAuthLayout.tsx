
import React from 'react';
import { AmberLogo } from '../components/AmberLogo';
import { AmberSettingsToolbar } from '../components/AmberSettingsToolbar';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AmberAuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex bg-obsidian-outer">
      <div className="hidden lg:flex lg:w-1/2 bg-obsidian-panel relative overflow-hidden flex-col justify-between p-12 border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-brand/5 via-obsidian-panel to-obsidian-panel pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay" />
        
        <div className="relative z-10 flex items-center justify-between">
          <AmberLogo className="w-12 h-12" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center flex-1">
           <div className="w-[400px] h-[400px] bg-brand/5 rounded-full blur-[100px] absolute" />
           <div className="relative bg-obsidian-card/30 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-700">
              <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                 <div className="w-3 h-3 rounded-full bg-danger" />
                 <div className="w-3 h-3 rounded-full bg-warning" />
                 <div className="w-3 h-3 rounded-full bg-success" />
              </div>
              <div className="space-y-4 w-64">
                 <div className="h-2 bg-white/10 rounded w-3/4" />
                 <div className="h-2 bg-white/10 rounded w-1/2" />
                 <div className="h-32 bg-white/5 rounded mt-4 border border-white/5 flex items-center justify-center">
                    <AmberLogo className="w-16 h-16 opacity-20" />
                 </div>
              </div>
           </div>
        </div>

        <div className="relative z-10 space-y-2">
          <h2 className="text-4xl font-black text-zinc-text tracking-tighter uppercase italic">Manage Your <span className="text-brand">Ecosystem</span></h2>
          <p className="text-sm font-medium text-zinc-muted max-w-md leading-relaxed">
            Real-time analytics, inventory control, and secure node synchronization for the modern enterprise.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-obsidian-outer flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-6 inset-x-6 flex items-center justify-between pointer-events-none lg:justify-end">
           <div className="lg:hidden pointer-events-auto">
              <AmberLogo className="w-8 h-8" />
           </div>
           <div className="pointer-events-auto">
              <AmberSettingsToolbar />
           </div>
        </div>

        <div className="w-full max-w-[420px] animate-fade-up">
           {children}
        </div>
        
        <div className="absolute bottom-6 text-center">
           <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-[0.2em] opacity-40">ZoneVast Secure Node v4.12</p>
        </div>
      </div>
    </div>
  );
};

