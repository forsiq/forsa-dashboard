
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { 
  ArrowLeft, 
  Printer, 
  Truck, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Package, 
  User, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Send,
  Download,
  AlertCircle,
  Copy
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { paths } from '../../../routes/paths';

// --- Mock Data ---
const ORDER = {
  id: 'ORD-2025-001',
  date: 'May 20, 2025 at 10:42 AM',
  status: { payment: 'Paid', fulfillment: 'Unfulfilled' },
  customer: {
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 012-3456',
    avatar: 'AM',
    ordersCount: 12,
    totalSpent: '$4,240.00'
  },
  addresses: {
    shipping: {
      line1: '1284 Tech Plaza, Suite 400',
      line2: '',
      city: 'San Francisco',
      state: 'CA',
      postal: '94107',
      country: 'USA'
    },
    billing: {
      line1: '1284 Tech Plaza, Suite 400',
      line2: '',
      city: 'San Francisco',
      state: 'CA',
      postal: '94107',
      country: 'USA'
    }
  },
  items: [
    { id: 1, name: 'Neural-Link Adapter', sku: 'SKU-8001', price: 450.00, qty: 2, total: 900.00, image: 'hsl(210, 60%, 25%)' },
    { id: 2, name: 'Quantum Glass Screen', sku: 'SKU-8002', price: 1200.00, qty: 1, total: 1200.00, image: 'hsl(280, 60%, 25%)' },
    { id: 3, name: 'Haptic Gloves', sku: 'SKU-8003', price: 89.99, qty: 1, total: 89.99, image: 'hsl(150, 60%, 25%)' },
  ],
  pricing: {
    subtotal: 2189.99,
    discount: 50.00,
    shipping: 25.00,
    tax: 180.50,
    total: 2345.49
  },
  transactions: [
    { id: 'TXN-9921-X', date: 'May 20, 2025', method: 'Visa •••• 4242', amount: 2345.49, status: 'Success' }
  ],
  timeline: [
    { id: 1, title: 'Order Placed', desc: 'Order received via Online Store', date: 'May 20, 10:42 AM', icon: ShoppingCartIcon, color: 'text-brand' },
    { id: 2, title: 'Payment Confirmed', desc: 'Visa ending in 4242 was charged $2,345.49', date: 'May 20, 10:43 AM', icon: CreditCard, color: 'text-success' },
    { id: 3, title: 'Order Confirmed', desc: 'Confirmation email sent to customer', date: 'May 20, 10:43 AM', icon: Mail, color: 'text-info' },
  ],
  notes: [
    { id: 1, author: 'System', text: 'Risk analysis passed. Score: Low Risk.', date: 'May 20, 10:42 AM' },
    { id: 2, author: 'Support Agent', text: 'Customer requested delayed shipping to June 1st.', date: 'May 20, 11:15 AM' }
  ]
};

// Icons Helper
function ShoppingCartIcon(props: any) {
  return <Package {...props} />; // Using Package as generic order icon
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'items', label: 'Items' },
  { id: 'customer', label: 'Customer' },
  { id: 'payments', label: 'Payments' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'notes', label: 'Notes' },
];

export const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [noteInput, setNoteInput] = useState('');

  // Status Styling
  const getPayStatusStyle = (status: string) => status === 'Paid' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20';
  const getFulfillStatusStyle = (status: string) => status === 'Fulfilled' ? 'bg-success/10 text-success border-success/20' : 'bg-brand/10 text-brand border-brand/20';

  const handleAddNote = () => {
    if(!noteInput.trim()) return;
    ORDER.notes.push({ 
        id: Date.now(), 
        author: 'You', 
        text: noteInput, 
        date: new Date().toLocaleString() 
    });
    setNoteInput('');
  };

  return (
    <div className="animate-fade-up max-w-[1600px] mx-auto py-6 space-y-8">
      
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-white/5 pb-6">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => navigate(paths.orders)}
            className="p-2 bg-white/5 rounded-sm hover:bg-white/10 text-zinc-muted hover:text-zinc-text transition-colors mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-3xl font-black text-zinc-text uppercase italic tracking-tighter leading-none">{ORDER.id}</h1>
               <span className="text-[10px] font-mono text-zinc-muted">{ORDER.date}</span>
            </div>
            <div className="flex items-center gap-3">
               <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest flex items-center gap-1.5", getPayStatusStyle(ORDER.status.payment))}>
                 <div className={cn("w-1.5 h-1.5 rounded-full", ORDER.status.payment === 'Paid' ? "bg-success" : "bg-warning")} />
                 {ORDER.status.payment}
               </span>
               <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest flex items-center gap-1.5", getFulfillStatusStyle(ORDER.status.fulfillment))}>
                 <div className={cn("w-1.5 h-1.5 rounded-full", ORDER.status.fulfillment === 'Fulfilled' ? "bg-success" : "bg-brand")} />
                 {ORDER.status.fulfillment}
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <AmberButton variant="secondary" size="sm">
              <Printer className="w-3.5 h-3.5 mr-2" /> Print Invoice
           </AmberButton>
           <AmberButton size="sm">
              <Truck className="w-3.5 h-3.5 mr-2" /> Ship Order
           </AmberButton>
           <div className="w-px h-8 bg-white/5 mx-2" />
           <button className="p-2.5 text-zinc-muted hover:text-zinc-text bg-white/5 hover:bg-white/10 rounded-sm transition-all border border-white/5">
              <MoreVertical className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="border-b border-white/5">
         <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                     "px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap rounded-t-sm",
                     activeTab === tab.id ? "text-brand bg-white/[0.02]" : "text-zinc-muted hover:text-zinc-text hover:bg-white/[0.01]"
                  )}
               >
                  {tab.label}
                  {activeTab === tab.id && (
                     <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand animate-in fade-in zoom-in duration-300" />
                  )}
               </button>
            ))}
         </div>
      </div>

      {/* 3. Tab Content */}
      <div className="min-h-[500px]">
         
         {/* --- OVERVIEW TAB --- */}
         {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4">
               {/* Left Col: Order Items & Totals */}
               <div className="lg:col-span-2 space-y-6">
                  <AmberCard noPadding className="overflow-hidden">
                     <div className="px-6 py-4 border-b border-white/5 bg-obsidian-outer/30 flex justify-between items-center">
                        <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Order Items ({ORDER.items.length})</h3>
                        <button className="text-[9px] font-bold text-brand hover:underline uppercase tracking-widest">Edit Items</button>
                     </div>
                     <table className="w-full text-left">
                        <thead className="bg-white/[0.01] text-[9px] font-black text-zinc-muted uppercase tracking-widest border-b border-white/5">
                           <tr>
                              <th className="px-6 py-3">Product</th>
                              <th className="px-6 py-3 text-right">Price</th>
                              <th className="px-6 py-3 text-center">Qty</th>
                              <th className="px-6 py-3 text-right">Total</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {ORDER.items.map(item => (
                              <tr key={item.id} className="hover:bg-white/[0.02]">
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-sm bg-obsidian-outer border border-white/5 shrink-0" style={{ backgroundColor: item.image }} />
                                       <div>
                                          <p className="text-xs font-bold text-zinc-text">{item.name}</p>
                                          <p className="text-[9px] font-mono text-zinc-muted">{item.sku}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-right text-xs font-medium text-zinc-secondary">${item.price.toFixed(2)}</td>
                                 <td className="px-6 py-4 text-center text-xs font-bold text-zinc-text">{item.qty}</td>
                                 <td className="px-6 py-4 text-right text-xs font-bold text-zinc-text">${item.total.toFixed(2)}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                     
                     <div className="p-6 bg-obsidian-panel border-t border-white/5">
                        <div className="flex flex-col gap-2 max-w-xs ml-auto">
                           <div className="flex justify-between text-xs text-zinc-secondary">
                              <span>Subtotal</span>
                              <span>${ORDER.pricing.subtotal.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-xs text-zinc-secondary">
                              <span>Discount</span>
                              <span className="text-success">-${ORDER.pricing.discount.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-xs text-zinc-secondary">
                              <span>Shipping</span>
                              <span>${ORDER.pricing.shipping.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-xs text-zinc-secondary">
                              <span>Tax</span>
                              <span>${ORDER.pricing.tax.toFixed(2)}</span>
                           </div>
                           <div className="h-px bg-white/10 my-1" />
                           <div className="flex justify-between text-sm font-black text-zinc-text uppercase tracking-wide">
                              <span>Total</span>
                              <span>${ORDER.pricing.total.toFixed(2)}</span>
                           </div>
                        </div>
                     </div>
                  </AmberCard>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <AmberCard className="p-5">
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-zinc-muted" /> Payment Details
                           </h3>
                           <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded border uppercase", getPayStatusStyle(ORDER.status.payment))}>{ORDER.status.payment}</span>
                        </div>
                        <div className="space-y-3 text-xs">
                           <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-zinc-muted">Method</span>
                              <span className="text-zinc-text font-bold">Visa •••• 4242</span>
                           </div>
                           <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-zinc-muted">Transaction ID</span>
                              <span className="text-zinc-text font-mono">TXN-9921-X</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-zinc-muted">Date</span>
                              <span className="text-zinc-text">May 20, 2025</span>
                           </div>
                        </div>
                     </AmberCard>

                     <AmberCard className="p-5 border-l-2 border-l-brand">
                        <div className="flex items-center justify-between mb-4">
                           <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                              <User className="w-4 h-4 text-zinc-muted" /> Customer
                           </h3>
                           <button className="text-[9px] font-bold text-brand hover:underline uppercase">View Profile</button>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-xs">
                              {ORDER.customer.avatar}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-zinc-text">{ORDER.customer.name}</p>
                              <p className="text-[10px] text-zinc-muted">{ORDER.customer.ordersCount} Orders • {ORDER.customer.totalSpent} Spent</p>
                           </div>
                        </div>
                        <div className="space-y-1 text-[11px] text-zinc-secondary">
                           <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-zinc-muted" /> {ORDER.customer.email}</div>
                           <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-zinc-muted" /> {ORDER.customer.phone}</div>
                        </div>
                     </AmberCard>
                  </div>
               </div>

               {/* Right Col: Timeline & Notes */}
               <div className="space-y-6">
                  <AmberCard className="p-5">
                     <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-zinc-muted" /> Timeline
                     </h3>
                     <div className="space-y-6 relative pl-2 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                        {ORDER.timeline.map((event) => (
                           <div key={event.id} className="relative pl-8">
                              <div className={cn("absolute left-0 top-1 w-5 h-5 rounded-full border-2 border-obsidian-panel flex items-center justify-center bg-obsidian-outer", event.color.replace('text-', 'bg-'))}>
                                 <div className="w-1.5 h-1.5 rounded-full bg-obsidian-panel" />
                              </div>
                              <p className="text-xs font-bold text-zinc-text">{event.title}</p>
                              <p className="text-[10px] text-zinc-muted mt-0.5 leading-tight">{event.desc}</p>
                              <p className="text-[9px] font-mono text-zinc-muted/60 uppercase mt-1">{event.date}</p>
                           </div>
                        ))}
                     </div>
                  </AmberCard>

                  <AmberCard className="p-5 flex flex-col">
                     <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-muted" /> Notes
                     </h3>
                     <div className="flex-1 space-y-3 mb-4 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                        {ORDER.notes.map((note) => (
                           <div key={note.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-sm">
                              <div className="flex justify-between items-start mb-1">
                                 <span className="text-[10px] font-bold text-zinc-text">{note.author}</span>
                                 <span className="text-[9px] text-zinc-muted">{note.date}</span>
                              </div>
                              <p className="text-[11px] text-zinc-secondary leading-relaxed">{note.text}</p>
                           </div>
                        ))}
                     </div>
                     <div className="relative">
                        <input 
                           type="text" 
                           placeholder="Add internal note..." 
                           value={noteInput}
                           onChange={(e) => setNoteInput(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                           className="w-full bg-obsidian-outer border border-white/10 rounded-sm pl-3 pr-8 py-2 text-xs text-zinc-text outline-none focus:border-brand/30"
                        />
                        <button onClick={handleAddNote} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-muted hover:text-brand">
                           <Send className="w-3.5 h-3.5" />
                        </button>
                     </div>
                  </AmberCard>
               </div>
            </div>
         )}

         {/* --- CUSTOMER TAB --- */}
         {activeTab === 'customer' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4">
               <AmberCard className="p-6">
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4 flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-brand" /> Shipping Address
                  </h3>
                  <div className="text-sm text-zinc-secondary leading-relaxed space-y-1 p-4 bg-obsidian-outer border border-white/5 rounded-sm">
                     <p className="font-bold text-zinc-text">{ORDER.customer.name}</p>
                     <p>{ORDER.addresses.shipping.line1}</p>
                     {ORDER.addresses.shipping.line2 && <p>{ORDER.addresses.shipping.line2}</p>}
                     <p>{ORDER.addresses.shipping.city}, {ORDER.addresses.shipping.state} {ORDER.addresses.shipping.postal}</p>
                     <p>{ORDER.addresses.shipping.country}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                     <AmberButton variant="secondary" size="sm" className="w-full justify-center">Edit Address</AmberButton>
                     <AmberButton variant="secondary" size="sm" className="px-3"><Copy className="w-4 h-4" /></AmberButton>
                  </div>
               </AmberCard>

               <AmberCard className="p-6">
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4 flex items-center gap-2">
                     <CreditCard className="w-4 h-4 text-info" /> Billing Address
                  </h3>
                  <div className="text-sm text-zinc-secondary leading-relaxed space-y-1 p-4 bg-obsidian-outer border border-white/5 rounded-sm">
                     <p className="font-bold text-zinc-text">{ORDER.customer.name}</p>
                     <p>{ORDER.addresses.billing.line1}</p>
                     <p>{ORDER.addresses.billing.city}, {ORDER.addresses.billing.state} {ORDER.addresses.billing.postal}</p>
                     <p>{ORDER.addresses.billing.country}</p>
                  </div>
                  <div className="mt-4 text-[10px] text-zinc-muted italic text-center">
                     Same as shipping address
                  </div>
               </AmberCard>
            </div>
         )}

         {/* --- ITEMS TAB --- */}
         {activeTab === 'items' && (
            <AmberCard noPadding className="animate-in fade-in slide-in-from-right-4">
               <table className="w-full text-left">
                  <thead className="bg-obsidian-outer/50 text-[9px] font-black text-zinc-muted uppercase tracking-widest border-b border-white/5">
                     <tr>
                        <th className="px-6 py-4">Product Details</th>
                        <th className="px-6 py-4 text-right">Unit Price</th>
                        <th className="px-6 py-4 text-center">Quantity</th>
                        <th className="px-6 py-4 text-right">Tax Rate</th>
                        <th className="px-6 py-4 text-right">Total</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {ORDER.items.map(item => (
                        <tr key={item.id} className="hover:bg-white/[0.02]">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-sm bg-obsidian-outer border border-white/5 shrink-0" style={{ backgroundColor: item.image }} />
                                 <div>
                                    <p className="text-sm font-bold text-zinc-text">{item.name}</p>
                                    <p className="text-[10px] font-mono text-zinc-muted">{item.sku}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right text-sm text-zinc-secondary">${item.price.toFixed(2)}</td>
                           <td className="px-6 py-4 text-center">
                              <span className="inline-block px-3 py-1 bg-white/5 rounded-sm text-xs font-bold">{item.qty}</span>
                           </td>
                           <td className="px-6 py-4 text-right text-xs text-zinc-muted">Standard (8%)</td>
                           <td className="px-6 py-4 text-right text-sm font-bold text-zinc-text">${item.total.toFixed(2)}</td>
                           <td className="px-6 py-4 text-right">
                              <button className="p-2 hover:bg-white/5 rounded-sm text-zinc-muted hover:text-zinc-text transition-colors">
                                 <MoreVertical className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               <div className="p-6 bg-obsidian-outer/20 border-t border-white/5 flex justify-end">
                  <div className="w-64 space-y-2">
                     <div className="flex justify-between text-xs text-zinc-secondary">
                        <span>Subtotal</span>
                        <span>${ORDER.pricing.subtotal.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-xs text-zinc-secondary">
                        <span>Tax</span>
                        <span>${ORDER.pricing.tax.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-xs text-zinc-secondary">
                        <span>Shipping</span>
                        <span>${ORDER.pricing.shipping.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-xs text-zinc-secondary">
                        <span>Discount</span>
                        <span className="text-success">-${ORDER.pricing.discount.toFixed(2)}</span>
                     </div>
                     <div className="h-px bg-white/10 my-2" />
                     <div className="flex justify-between text-base font-black text-zinc-text uppercase tracking-wide">
                        <span>Total</span>
                        <span>${ORDER.pricing.total.toFixed(2)}</span>
                     </div>
                  </div>
               </div>
            </AmberCard>
         )}

         {/* --- SHIPPING TAB --- */}
         {activeTab === 'shipping' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
               <AmberCard className="p-6 flex items-start justify-between bg-obsidian-panel/60" glass>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-obsidian-outer border border-white/5 rounded-sm flex items-center justify-center text-zinc-muted">
                        <Truck className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-sm font-bold text-zinc-text uppercase tracking-wide">Standard Delivery</h3>
                        <p className="text-[10px] text-zinc-muted mt-1">FedEx Ground • Tracking: <span className="text-brand hover:underline cursor-pointer">TRK-9921-X</span></p>
                     </div>
                  </div>
                  <div className="text-right">
                     <span className="text-[10px] font-black px-2 py-1 rounded-sm bg-warning/10 text-warning border border-warning/20 uppercase tracking-widest">In Transit</span>
                     <p className="text-[9px] text-zinc-muted mt-2">Est. Delivery: May 24</p>
                  </div>
               </AmberCard>

               <AmberCard noPadding>
                  <div className="px-6 py-4 border-b border-white/5">
                     <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Package 1 (Default)</h3>
                  </div>
                  <div className="p-6">
                     <div className="space-y-3">
                        {ORDER.items.map(item => (
                           <div key={item.id} className="flex items-center gap-4 p-3 bg-obsidian-outer border border-white/5 rounded-sm">
                              <div className="w-8 h-8 rounded-sm bg-obsidian-panel border border-white/5 shrink-0" style={{ backgroundColor: item.image }} />
                              <div className="flex-1">
                                 <p className="text-xs font-bold text-zinc-text">{item.name}</p>
                                 <p className="text-[9px] font-mono text-zinc-muted">{item.sku}</p>
                              </div>
                              <span className="text-xs font-bold text-zinc-text">x{item.qty}</span>
                           </div>
                        ))}
                     </div>
                     <div className="mt-6 flex justify-end gap-2">
                        <AmberButton size="sm" variant="secondary">Print Packing Slip</AmberButton>
                        <AmberButton size="sm">Track Shipment</AmberButton>
                     </div>
                  </div>
               </AmberCard>
            </div>
         )}

         {/* --- PAYMENTS TAB --- */}
         {activeTab === 'payments' && (
            <AmberCard noPadding className="animate-in fade-in slide-in-from-right-4">
               <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-obsidian-outer/30">
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Transaction History</h3>
                  <button className="text-[9px] font-bold text-brand hover:underline uppercase">Capture Payment</button>
               </div>
               <table className="w-full text-left">
                  <thead className="bg-white/[0.01] text-[9px] font-black text-zinc-muted uppercase tracking-widest border-b border-white/5">
                     <tr>
                        <th className="px-6 py-3">Transaction ID</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Method</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {ORDER.transactions.map(txn => (
                        <tr key={txn.id} className="hover:bg-white/[0.02]">
                           <td className="px-6 py-4 font-mono text-[10px] text-zinc-secondary">{txn.id}</td>
                           <td className="px-6 py-4 text-[11px] text-zinc-muted">{txn.date}</td>
                           <td className="px-6 py-4 text-xs font-bold text-zinc-text">{txn.method}</td>
                           <td className="px-6 py-4 text-xs font-bold text-zinc-text">${txn.amount.toFixed(2)}</td>
                           <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-success/10 text-success border border-success/20 text-[9px] font-black uppercase tracking-widest">
                                 <CheckCircle2 className="w-3 h-3" /> {txn.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="text-[10px] font-bold text-zinc-muted hover:text-brand transition-colors">Details</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </AmberCard>
         )}

         {/* --- TIMELINE & NOTES TABS (Reuse Overview Components if desired, but separate for cleaner structure) --- */}
         {activeTab === 'timeline' && (
            <AmberCard className="p-8 animate-in fade-in slide-in-from-right-4">
               <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-muted" /> Order Timeline
               </h3>
               <div className="space-y-8 relative pl-3 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                  {ORDER.timeline.map((event) => (
                     <div key={event.id} className="relative pl-10">
                        <div className={cn("absolute left-0 top-0 w-6 h-6 rounded-full border-2 border-obsidian-panel flex items-center justify-center bg-obsidian-outer z-10", event.color.replace('text-', 'bg-'))}>
                           <event.icon className="w-3 h-3 text-obsidian-panel" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                           <p className="text-sm font-bold text-zinc-text">{event.title}</p>
                           <span className="text-[10px] font-mono text-zinc-muted uppercase">{event.date}</span>
                        </div>
                        <p className="text-xs text-zinc-secondary mt-1">{event.desc}</p>
                     </div>
                  ))}
               </div>
            </AmberCard>
         )}

         {activeTab === 'notes' && (
            <AmberCard className="p-6 flex flex-col h-[500px] animate-in fade-in slide-in-from-right-4">
               <div className="flex-1 space-y-4 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                  {ORDER.notes.map((note) => (
                     <div key={note.id} className="p-4 bg-obsidian-outer border border-white/5 rounded-sm flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                           {note.author.charAt(0)}
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-zinc-text">{note.author}</span>
                              <span className="text-[9px] text-zinc-muted">{note.date}</span>
                           </div>
                           <p className="text-sm text-zinc-secondary leading-relaxed">{note.text}</p>
                        </div>
                     </div>
                  ))}
               </div>
               <div className="relative border-t border-white/5 pt-4">
                  <textarea 
                     value={noteInput}
                     onChange={(e) => setNoteInput(e.target.value)}
                     placeholder="Type an internal note..."
                     className="w-full bg-obsidian-outer border border-white/10 rounded-sm p-4 pr-12 text-sm font-medium text-zinc-text outline-none focus:border-brand/30 min-h-[100px] resize-none"
                  />
                  <button 
                     onClick={handleAddNote}
                     disabled={!noteInput.trim()}
                     className="absolute bottom-4 right-4 p-2 bg-brand text-obsidian-outer rounded-sm hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                     <Send className="w-4 h-4 rtl:rotate-180" />
                  </button>
               </div>
            </AmberCard>
         )}

      </div>
    </div>
  );
};
