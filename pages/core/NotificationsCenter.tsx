
import React from 'react';
import { Card } from '../../components/ui/Card';
import { Bell, Check, Trash2, ShieldAlert, Package, Activity, Terminal } from 'lucide-react';
import { cn } from '../../lib/cn';

const notifications = [
  { id: 1, title: 'Security: Unauthorized Node Access Attempt', desc: 'A remote node from IP 192.168.1.4 tried to initiate an unencrypted sync.', time: '2 mins ago', type: 'critical', icon: ShieldAlert },
  { id: 2, title: 'Inventory: Critical Stock Level', desc: 'SKU-8821 (Neural Link) dropped below safety buffer in Region US-East.', time: '14 mins ago', type: 'warning', icon: Package },
  { id: 3, title: 'System: Schema Validation Success', desc: 'The master catalog schema has been validated and committed to all nodes.', time: '1 hr ago', type: 'success', icon: Check },
  { id: 4, title: 'Cloud: New Compute Node Initialized', desc: 'Compute-X01 is now active and joining the primary cluster.', time: '4 hrs ago', type: 'info', icon: Terminal },
];

export const NotificationsCenter = () => {
  return (
    <div className="animate-fade-up max-w-4xl mx-auto py-4 px-2 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
           <Bell className="w-5 h-5 text-brand" />
           <div>
             <h1 className="text-xl font-black text-zinc-text tracking-tighter uppercase italic">Signal Intelligence</h1>
             <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em]">Central Alerting and System Monitoring</p>
           </div>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-black text-brand hover:underline uppercase tracking-widest">
              Mark All as Read
           </button>
           <button className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-black text-danger/60 hover:text-danger uppercase tracking-widest">
              <Trash2 className="w-3.5 h-3.5" /> Clear Signals
           </button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className={cn(
            "p-4 border-l-2 transition-all hover:translate-x-1",
            n.type === 'critical' ? 'border-l-danger bg-danger/5' :
            n.type === 'warning' ? 'border-l-warning bg-warning/5' :
            n.type === 'success' ? 'border-l-success bg-success/5' : 'border-l-info bg-info/5'
          )}>
            <div className="flex gap-4">
               <div className={cn(
                 "w-10 h-10 rounded-sm border flex items-center justify-center shrink-0",
                 n.type === 'critical' ? 'bg-obsidian-outer border-danger/20 text-danger' :
                 n.type === 'warning' ? 'bg-obsidian-outer border-warning/20 text-warning' :
                 n.type === 'success' ? 'bg-obsidian-outer border-success/20 text-success' : 'bg-obsidian-outer border-info/20 text-info'
               )}>
                  <n.icon className="w-5 h-5" />
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                     <h3 className="text-xs font-black text-zinc-text uppercase tracking-tight">{n.title}</h3>
                     <span className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">{n.time}</span>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-secondary leading-relaxed uppercase italic opacity-70">
                    {n.desc}
                  </p>
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
