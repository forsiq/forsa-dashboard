
import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AmberSlideOver } from '../amber-ui/components/AmberSlideOver';
import { AmberInput } from '../amber-ui/components/AmberInput';
import { 
  CreditCard, 
  Check, 
  Download, 
  Zap, 
  Users, 
  Database, 
  Plus, 
  ShieldCheck, 
  AlertTriangle,
  FileText,
  Clock,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { cn } from '../lib/cn';

export const Billing = () => {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('Pro');

  const plans = [
    { name: 'Starter', price: '$49', period: '/mo', features: ['5 Team Members', '10GB Storage', 'Basic Support', 'Community Access'] },
    { name: 'Pro', price: '$299', period: '/mo', features: ['20 Team Members', '1TB Storage', 'Priority Support', 'Advanced Analytics', 'API Access'] },
    { name: 'Enterprise', price: '$2,499', period: '/mo', features: ['Unlimited Members', 'Unlimited Storage', '24/7 Dedicated Support', 'Custom Integrations', 'SLA Guarantee'] },
  ];

  const usage = [
    { label: 'Storage Used', value: '840GB', max: '1TB', percent: 84, icon: Database, color: 'bg-brand' },
    { label: 'API Calls', value: '452k', max: '1M', percent: 45, icon: Zap, color: 'bg-info' },
    { label: 'Seats Occupied', value: '12', max: '20', percent: 60, icon: Users, color: 'bg-success' },
  ];

  const invoices = [
    { id: 'INV-2025-001', date: 'May 01, 2025', amount: '$299.00', status: 'Paid' },
    { id: 'INV-2025-002', date: 'Apr 01, 2025', amount: '$299.00', status: 'Paid' },
    { id: 'INV-2025-003', date: 'Mar 01, 2025', amount: '$299.00', status: 'Paid' },
    { id: 'INV-2025-004', date: 'Feb 01, 2025', amount: '$49.00', status: 'Paid' }, // Upgraded later
  ];

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'Visa', last4: '4242', exp: '12/28', default: true },
    { id: 2, type: 'Mastercard', last4: '8821', exp: '09/26', default: false },
  ]);

  return (
    <div className="animate-fade-up space-y-8 max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Billing & Subscription</h1>
        <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Manage your plan, payment methods, and invoices</p>
      </div>

      {/* Top Row: Plan & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Current Plan Card */}
        <Card className="lg:col-span-2 p-8 border-brand/20 bg-gradient-to-br from-obsidian-panel to-brand/5 relative overflow-hidden flex flex-col justify-between">
           <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                 <div className="flex items-center gap-3 mb-2">
                    <span className="inline-block px-2 py-0.5 bg-brand text-obsidian-outer text-[9px] font-black uppercase tracking-widest rounded-sm">Active Plan</span>
                    {currentPlan === 'Pro' && <span className="text-[9px] font-bold text-brand uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure Node</span>}
                 </div>
                 <h2 className="text-4xl font-black text-zinc-text uppercase italic tracking-tighter">{currentPlan} Plan</h2>
                 <p className="text-sm font-bold text-zinc-muted mt-2 max-w-md">
                    Your plan renews on <span className="text-zinc-text">June 1, 2025</span>.
                 </p>
              </div>
              <div className="text-right">
                 <p className="text-3xl font-black text-zinc-text tracking-tighter">$299<span className="text-sm font-bold text-zinc-muted">/mo</span></p>
              </div>
           </div>

           <div className="relative z-10 mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                 {['20 Team Members', '1TB Cloud Storage', 'Priority Support'].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-zinc-secondary">
                       <Check className="w-3.5 h-3.5 text-brand" /> {feat}
                    </div>
                 ))}
              </div>
              <div className="flex items-end justify-end">
                 <Button onClick={() => setIsUpgradeOpen(true)}>Manage Subscription</Button>
              </div>
           </div>
           
           {/* Decor */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-[80px] pointer-events-none" />
        </Card>

        {/* Usage Metrics */}
        <Card className="p-6 flex flex-col justify-center gap-6">
           <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-zinc-muted" /> Resource Usage
           </h3>
           <div className="space-y-6">
              {usage.map((metric, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-zinc-muted uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><metric.icon className="w-3 h-3" /> {metric.label}</span>
                       <span>{metric.value} / {metric.max}</span>
                    </div>
                    <div className="h-1.5 bg-obsidian-outer rounded-full border border-white/5 overflow-hidden">
                       <div className={cn("h-full rounded-full transition-all duration-1000", metric.color)} style={{ width: `${metric.percent}%` }} />
                    </div>
                 </div>
              ))}
           </div>
           <div className="mt-2 p-3 bg-obsidian-outer/50 border border-white/5 rounded-sm flex gap-3 items-start">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div>
                 <p className="text-[10px] font-bold text-zinc-text">Storage Approaching Limit</p>
                 <p className="text-[9px] text-zinc-muted leading-tight mt-0.5">You are at 84% capacity. Consider upgrading or purging old assets.</p>
              </div>
           </div>
        </Card>
      </div>

      {/* Middle Row: Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Payment Methods</h3>
               <Button size="sm" variant="ghost" onClick={() => setIsPaymentOpen(true)}>
                  <Plus className="w-3.5 h-3.5 mr-2" /> Add Method
               </Button>
            </div>
            <div className="space-y-3">
               {paymentMethods.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-4 bg-obsidian-outer border border-white/5 rounded-sm hover:border-white/10 transition-colors group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-7 bg-white/5 rounded-sm flex items-center justify-center border border-white/10">
                           <CreditCard className="w-4 h-4 text-zinc-muted" />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-zinc-text uppercase tracking-tight flex items-center gap-2">
                              {card.type} •••• {card.last4}
                              {card.default && <span className="text-[8px] bg-brand/10 text-brand px-1.5 py-0.5 rounded border border-brand/20">DEFAULT</span>}
                           </p>
                           <p className="text-[9px] font-mono text-zinc-muted uppercase">Expires {card.exp}</p>
                        </div>
                     </div>
                     <button className="text-[10px] font-black text-zinc-muted hover:text-danger uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100">Remove</button>
                  </div>
               ))}
            </div>
         </Card>

         <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Billing Details</h3>
               <button className="text-[10px] font-black text-brand hover:underline uppercase tracking-widest">Edit</button>
            </div>
            <div className="space-y-4">
               <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm space-y-1">
                  <p className="text-xs font-bold text-zinc-text uppercase">ZoneVast Inc.</p>
                  <p className="text-[10px] text-zinc-muted">1284 Tech Plaza, Suite 400</p>
                  <p className="text-[10px] text-zinc-muted">San Francisco, CA 94107</p>
                  <p className="text-[10px] text-zinc-muted">United States</p>
               </div>
               <div className="flex justify-between items-center px-4 py-3 bg-obsidian-outer border border-white/5 rounded-sm">
                  <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Tax ID (EIN)</span>
                  <span className="text-[11px] font-mono font-bold text-zinc-text">82-4419201</span>
               </div>
            </div>
         </Card>
      </div>

      {/* Bottom Row: Invoices */}
      <Card className="p-0 overflow-hidden bg-obsidian-panel border-white/10" noPadding>
         <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
               <FileText className="w-4 h-4 text-zinc-muted" /> Invoice History
            </h3>
            <button className="text-[10px] font-black text-zinc-muted hover:text-zinc-text uppercase tracking-widest flex items-center gap-1">
               View All <ArrowUpRight className="w-3 h-3" />
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-obsidian-outer/30 border-b border-white/5">
                     <th className="px-6 py-4 text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">Invoice ID</th>
                     <th className="px-6 py-4 text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">Date</th>
                     <th className="px-6 py-4 text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">Amount</th>
                     <th className="px-6 py-4 text-[9px] font-black text-zinc-muted uppercase tracking-[0.2em]">Status</th>
                     <th className="px-6 py-4"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {invoices.map((inv) => (
                     <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-mono text-[10px] font-bold text-zinc-secondary">{inv.id}</td>
                        <td className="px-6 py-4 text-[11px] font-bold text-zinc-text">{inv.date}</td>
                        <td className="px-6 py-4 text-[11px] font-bold text-zinc-text">{inv.amount}</td>
                        <td className="px-6 py-4">
                           <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-success/10 border border-success/20 text-success text-[9px] font-black uppercase tracking-widest">
                              <Check className="w-3 h-3" /> {inv.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="p-2 hover:bg-white/5 rounded-sm text-zinc-muted hover:text-brand transition-colors" title="Download PDF">
                              <Download className="w-4 h-4" />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </Card>

      {/* Upgrade Modal */}
      <AmberSlideOver
         isOpen={isUpgradeOpen}
         onClose={() => setIsUpgradeOpen(false)}
         title="Change Subscription Plan"
         description="Scale your resources to match your team's needs."
      >
         <div className="space-y-4">
            {plans.map((plan) => (
               <div 
                  key={plan.name} 
                  className={cn(
                     "p-4 border rounded-sm transition-all cursor-pointer hover:border-brand/30 relative overflow-hidden group",
                     currentPlan === plan.name ? "bg-brand/5 border-brand ring-1 ring-brand/20" : "bg-obsidian-outer border-white/5"
                  )}
                  onClick={() => {
                     setCurrentPlan(plan.name);
                     setIsUpgradeOpen(false);
                  }}
               >
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="text-lg font-black text-zinc-text uppercase italic">{plan.name}</h3>
                        <p className="text-2xl font-black text-zinc-text tracking-tighter mt-1">{plan.price}<span className="text-xs font-bold text-zinc-muted">{plan.period}</span></p>
                     </div>
                     {currentPlan === plan.name && <div className="w-6 h-6 bg-brand text-black rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>}
                  </div>
                  <div className="space-y-2 border-t border-white/5 pt-4">
                     {plan.features.map((feat, i) => (
                        <p key={i} className="text-[10px] font-bold text-zinc-secondary flex items-center gap-2">
                           <span className="w-1 h-1 bg-zinc-muted rounded-full" /> {feat}
                        </p>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      </AmberSlideOver>

      {/* Payment Method Modal */}
      <AmberSlideOver
         isOpen={isPaymentOpen}
         onClose={() => setIsPaymentOpen(false)}
         title="Add Payment Method"
         description="Securely link a new credit or debit card."
         footer={
            <>
               <Button variant="ghost" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
               <Button onClick={() => setIsPaymentOpen(false)}>Save Card</Button>
            </>
         }
      >
         <div className="space-y-6">
            <AmberInput label="Cardholder Name" placeholder="Name on card" />
            <AmberInput label="Card Number" placeholder="0000 0000 0000 0000" icon={<CreditCard className="w-4 h-4" />} />
            <div className="grid grid-cols-2 gap-4">
               <AmberInput label="Expiry Date" placeholder="MM/YY" />
               <AmberInput label="CVC" placeholder="123" icon={<ShieldCheck className="w-4 h-4" />} />
            </div>
            <div className="flex items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-sm">
               <ShieldCheck className="w-4 h-4 text-success" />
               <p className="text-[9px] font-bold text-zinc-muted uppercase">Payments are secured by 256-bit SSL encryption.</p>
            </div>
         </div>
      </AmberSlideOver>
    </div>
  );
};
