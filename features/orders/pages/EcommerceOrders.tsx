
import React, { useState, useMemo } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { AmberDropdown } from '../../../amber-ui/components/AmberDropdown';
import { AmberSlideOver } from '../../../amber-ui/components/AmberSlideOver';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  MoreVertical, 
  ChevronRight, 
  ChevronDown, 
  CheckSquare, 
  Square,
  Package, 
  Truck, 
  CreditCard, 
  User, 
  Calendar, 
  FileText, 
  Printer, 
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Mail,
  Phone,
  Trash2,
  Archive,
  RefreshCw,
  Box
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
interface OrderItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  image: string;
}

interface OrderEvent {
  id: string;
  title: string;
  desc: string;
  date: string;
  icon: any;
  color: string;
}

interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
  date: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
  fulfillmentStatus: 'Unfulfilled' | 'Partially Fulfilled' | 'Fulfilled';
  items: OrderItem[];
  timeline: OrderEvent[];
  shippingAddress: string;
  billingAddress: string;
}

// --- Mock Data ---
const MOCK_ORDERS: Order[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `ORD-${2025000 + i}`,
  customer: {
    name: ['Alex Morgan', 'Sarah Chen', 'James Wilson', 'Maria Garcia', 'David Kim'][i % 5],
    email: `customer${i}@example.com`,
    phone: '+1 (555) 012-3456',
    avatar: ['AM', 'SC', 'JW', 'MG', 'DK'][i % 5]
  },
  date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
  total: Math.floor(Math.random() * 500) + 50,
  status: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'][i % 5] as any,
  paymentStatus: ['Paid', 'Paid', 'Paid', 'Unpaid', 'Refunded'][i % 5] as any,
  fulfillmentStatus: ['Unfulfilled', 'Partially Fulfilled', 'Fulfilled', 'Fulfilled', 'Unfulfilled'][i % 5] as any,
  shippingAddress: '123 Tech Plaza, San Francisco, CA 94107',
  billingAddress: '123 Tech Plaza, San Francisco, CA 94107',
  items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, j) => ({
    id: `ITEM-${i}-${j}`,
    name: ['Wireless Headphones', 'Mechanical Keyboard', 'Ergonomic Mouse', 'USB-C Hub', 'Monitor Stand'][j % 5],
    sku: `SKU-${1000 + j}`,
    price: Math.floor(Math.random() * 100) + 20,
    qty: Math.floor(Math.random() * 2) + 1,
    image: `hsl(${Math.random() * 360}, 70%, 20%)`
  })),
  timeline: [
    { id: 'ev1', title: 'Order Placed', desc: 'Order received via Online Store', date: '2 days ago', icon: ShoppingCart, color: 'text-brand' },
    { id: 'ev2', title: 'Payment Confirmed', desc: 'Payment of $120.00 verified', date: '2 days ago', icon: CreditCard, color: 'text-success' },
    { id: 'ev3', title: 'Processing', desc: 'Order sent to warehouse', date: '1 day ago', icon: Package, color: 'text-info' }
  ]
}));

export const EcommerceOrders = () => {
  // -- State --
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Detail View
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'items' | 'customer' | 'timeline'>('info');

  // -- Helpers --
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      
      const orderDate = new Date(order.date).getTime();
      const matchesStart = dateRange.start ? orderDate >= new Date(dateRange.start).getTime() : true;
      const matchesEnd = dateRange.end ? orderDate <= new Date(dateRange.end).getTime() : true;

      return matchesSearch && matchesStatus && matchesStart && matchesEnd;
    });
  }, [orders, searchQuery, statusFilter, dateRange]);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredOrders.map(o => o.id)));
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedRows(newSet);
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Delivered': return 'bg-success/10 text-success border-success/20';
      case 'Shipped': return 'bg-info/10 text-info border-info/20';
      case 'Processing': return 'bg-brand/10 text-brand border-brand/20';
      case 'Cancelled': return 'bg-danger/10 text-danger border-danger/20';
      case 'Returned': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-white/5 text-zinc-muted border-white/10';
    }
  };

  const handleBulkAction = (action: string) => {
    alert(`${action} applied to ${selectedIds.size} orders`);
    setSelectedIds(new Set());
  };

  return (
    <div className="animate-fade-up space-y-6 min-h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <ShoppingCart className="w-5 h-5 text-brand" />
             <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">Order Management</h1>
          </div>
          <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.3em] mt-1">Track and fulfillment center</p>
        </div>
        <div className="flex gap-2">
          <AmberButton variant="ghost" size="sm">
            <Download className="w-3.5 h-3.5 mr-2" /> Export
          </AmberButton>
          <AmberButton size="sm">
            <Plus className="w-3.5 h-3.5 mr-2" /> Create Order
          </AmberButton>
        </div>
      </div>

      {/* Toolbar */}
      <AmberCard noPadding className="p-4 flex flex-col xl:flex-row gap-4 items-end bg-obsidian-panel border-white/5 relative z-20">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
            <input 
              type="text" 
              placeholder="Search Orders, Customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/50"
            />
          </div>
        </div>
        
        <AmberDropdown 
          label="Status"
          options={['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map(s => ({label: s, value: s}))}
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-full xl:w-48"
        />

        <div className="flex gap-2 w-full xl:w-auto">
           <div className="space-y-1.5 flex-1">
              <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Start Date</label>
              <input type="date" className="h-10 w-full bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
           </div>
           <div className="space-y-1.5 flex-1">
              <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">End Date</label>
              <input type="date" className="h-10 w-full bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
           </div>
        </div>
        
        <button className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5">
          <Filter className="w-4 h-4" />
        </button>
      </AmberCard>

      {/* Bulk Actions Bar */}
      <div className={cn(
         "fixed bottom-6 left-1/2 -translate-x-1/2 bg-obsidian-card border border-white/10 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 z-40 transition-all duration-300",
         selectedIds.size > 0 ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      )}>
         <span className="text-[10px] font-black text-zinc-text uppercase tracking-widest border-r border-white/10 pr-6">
            {selectedIds.size} Selected
         </span>
         <div className="flex items-center gap-2">
            <button onClick={() => handleBulkAction('Confirm')} className="p-2 text-zinc-muted hover:text-success transition-colors rounded-full hover:bg-white/5" title="Confirm">
               <CheckCircle2 className="w-4 h-4" />
            </button>
            <button onClick={() => handleBulkAction('Ship')} className="p-2 text-zinc-muted hover:text-info transition-colors rounded-full hover:bg-white/5" title="Ship">
               <Truck className="w-4 h-4" />
            </button>
            <button onClick={() => handleBulkAction('Archive')} className="p-2 text-zinc-muted hover:text-warning transition-colors rounded-full hover:bg-white/5" title="Archive">
               <Archive className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button onClick={() => handleBulkAction('Cancel')} className="p-2 text-zinc-muted hover:text-danger transition-colors rounded-full hover:bg-white/5" title="Cancel">
               <Trash2 className="w-4 h-4" />
            </button>
         </div>
         <button onClick={() => setSelectedIds(new Set())} className="ml-2 p-1 bg-white/10 rounded-full text-zinc-muted hover:bg-white/20 transition-colors">
            <X className="w-3 h-3" />
         </button>
      </div>

      {/* Data Table */}
      <AmberCard noPadding className="flex-1 flex flex-col bg-obsidian-panel border-white/5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-obsidian-outer/50 border-b border-white/5 text-[9px] font-black text-zinc-muted uppercase tracking-widest sticky top-0 z-10">
              <tr>
                <th className="w-12 px-6 py-4 text-center">
                  <button onClick={toggleSelectAll} className="hover:text-brand transition-colors">
                    {selectedIds.size > 0 && selectedIds.size === filteredOrders.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="w-10"></th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Fulfillment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className={cn(
                    "hover:bg-white/[0.02] transition-colors group",
                    selectedIds.has(order.id) && "bg-brand/[0.03]"
                  )}>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleSelect(order.id)} className={cn("transition-colors", selectedIds.has(order.id) ? "text-brand" : "text-zinc-muted")}>
                        {selectedIds.has(order.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-2 py-4 text-center">
                      <button 
                        onClick={() => toggleExpand(order.id)}
                        className={cn("p-1 rounded-sm text-zinc-muted hover:text-brand hover:bg-white/5 transition-all", expandedRows.has(order.id) && "text-brand rotate-90")}
                      >
                        <ChevronRight className="w-4 h-4 transition-transform" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                       <span 
                         className="font-mono text-[10px] font-bold text-zinc-text group-hover:text-brand transition-colors cursor-pointer"
                         onClick={() => setSelectedOrder(order)}
                       >
                         {order.id}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-obsidian-outer border border-white/10 flex items-center justify-center text-[9px] font-bold text-zinc-muted">
                             {order.customer.avatar}
                          </div>
                          <div>
                             <p className="text-xs font-bold text-zinc-text">{order.customer.name}</p>
                             <p className="text-[9px] text-zinc-muted">{order.customer.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-[10px] font-bold text-zinc-muted">{order.date}</td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-zinc-text">{order.items.reduce((a, b) => a + b.qty, 0)}</td>
                    <td className="px-6 py-4 text-xs font-bold text-zinc-text">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                       <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest", getStatusStyle(order.status))}>
                          {order.status}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={cn(
                          "flex items-center gap-1.5 text-[9px] font-bold uppercase",
                          order.paymentStatus === 'Paid' ? "text-success" : order.paymentStatus === 'Refunded' ? "text-warning" : "text-danger"
                       )}>
                          {order.paymentStatus === 'Paid' && <CheckCircle2 className="w-3 h-3" />}
                          {order.paymentStatus}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={cn(
                          "text-[9px] font-bold uppercase tracking-tight",
                          order.fulfillmentStatus === 'Fulfilled' ? "text-info" : "text-zinc-muted"
                       )}>
                          {order.fulfillmentStatus}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => setSelectedOrder(order)}
                         className="p-1.5 text-zinc-muted hover:text-zinc-text hover:bg-white/5 rounded-sm transition-colors"
                       >
                          <MoreVertical className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Row */}
                  {expandedRows.has(order.id) && (
                    <tr className="bg-obsidian-outer/30 shadow-inner">
                       <td colSpan={11} className="px-6 py-4">
                          <div className="ml-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-3 p-2 bg-obsidian-panel border border-white/5 rounded-sm">
                                   <div className="w-10 h-10 rounded-sm bg-obsidian-outer border border-white/5 shrink-0" style={{ backgroundColor: item.image }} />
                                   <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-bold text-zinc-text truncate">{item.name}</p>
                                      <p className="text-[9px] font-mono text-zinc-muted">{item.sku}</p>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-[10px] font-bold text-zinc-text">x{item.qty}</p>
                                      <p className="text-[9px] font-bold text-zinc-muted">${item.price}</p>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </AmberCard>

      {/* Detail SlideOver */}
      <AmberSlideOver
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.id}` : ''}
        description={selectedOrder ? `Placed on ${selectedOrder.date} by ${selectedOrder.customer.name}` : ''}
        footer={
           <div className="flex justify-between w-full">
              <AmberButton variant="ghost" onClick={() => setSelectedOrder(null)}>Close</AmberButton>
              <div className="flex gap-2">
                 <AmberButton variant="secondary" onClick={() => alert('Print Invoice')}><Printer className="w-3.5 h-3.5 mr-2" /> Invoice</AmberButton>
                 {selectedOrder?.status === 'Pending' && <AmberButton>Process Order</AmberButton>}
              </div>
           </div>
        }
      >
         {selectedOrder && (
            <div className="space-y-6">
               {/* Status Bar */}
               <div className="flex flex-wrap gap-4 p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm items-center justify-between">
                  <div className="flex gap-3">
                     <span className={cn("text-[9px] font-black px-2 py-1 rounded-sm border uppercase tracking-widest", getStatusStyle(selectedOrder.status))}>
                        {selectedOrder.status}
                     </span>
                     <span className={cn("text-[9px] font-black px-2 py-1 rounded-sm border uppercase tracking-widest", selectedOrder.paymentStatus === 'Paid' ? "bg-success/10 border-success/20 text-success" : "bg-danger/10 border-danger/20 text-danger")}>
                        {selectedOrder.paymentStatus}
                     </span>
                  </div>
                  <p className="text-lg font-black text-zinc-text">${selectedOrder.total.toFixed(2)}</p>
               </div>

               {/* Tabs */}
               <div className="flex border-b border-white/5 gap-6">
                  {[
                    { id: 'info', label: 'Info' },
                    { id: 'items', label: 'Items' },
                    { id: 'customer', label: 'Customer' },
                    { id: 'timeline', label: 'Timeline' },
                  ].map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                           "pb-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2",
                           activeTab === tab.id ? "border-brand text-brand" : "border-transparent text-zinc-muted hover:text-zinc-text"
                        )}
                     >
                        {tab.label}
                     </button>
                  ))}
               </div>

               {/* Tab Content */}
               <div className="min-h-[300px]">
                  {activeTab === 'info' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Shipping Method</p>
                              <p className="text-xs font-bold text-zinc-text">Express Delivery (2-3 Days)</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest">Tracking Number</p>
                              <p className="text-xs font-mono text-brand cursor-pointer hover:underline">TRK-9921-X</p>
                           </div>
                        </div>
                        <div className="p-4 border border-white/5 rounded-sm bg-obsidian-outer/30">
                           <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest mb-2">Order Notes</h4>
                           <p className="text-xs text-zinc-muted italic">Customer requested weekend delivery if possible.</p>
                        </div>
                        <div className="space-y-3">
                           <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest border-b border-white/5 pb-2">Financials</h4>
                           <div className="flex justify-between text-xs"><span className="text-zinc-muted">Subtotal</span> <span>${(selectedOrder.total * 0.9).toFixed(2)}</span></div>
                           <div className="flex justify-between text-xs"><span className="text-zinc-muted">Tax</span> <span>${(selectedOrder.total * 0.05).toFixed(2)}</span></div>
                           <div className="flex justify-between text-xs"><span className="text-zinc-muted">Shipping</span> <span>${(selectedOrder.total * 0.05).toFixed(2)}</span></div>
                           <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/5"><span>Total</span> <span>${selectedOrder.total.toFixed(2)}</span></div>
                        </div>
                     </div>
                  )}

                  {activeTab === 'items' && (
                     <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                        {selectedOrder.items.map(item => (
                           <div key={item.id} className="flex items-center gap-4 p-3 bg-obsidian-outer border border-white/5 rounded-sm">
                              <div className="w-12 h-12 rounded-sm bg-obsidian-panel border border-white/5 shrink-0" style={{ backgroundColor: item.image }} />
                              <div className="flex-1 min-w-0">
                                 <p className="text-xs font-bold text-zinc-text">{item.name}</p>
                                 <p className="text-[9px] font-mono text-zinc-muted">{item.sku}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-xs font-bold text-zinc-text">x{item.qty}</p>
                                 <p className="text-[10px] text-zinc-muted">${item.price * item.qty}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}

                  {activeTab === 'customer' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center gap-4 p-4 bg-obsidian-outer border border-white/5 rounded-sm">
                           <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-black text-sm">
                              {selectedOrder.customer.avatar}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-zinc-text">{selectedOrder.customer.name}</p>
                              <div className="flex gap-4 mt-1 text-[10px] text-zinc-muted">
                                 <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {selectedOrder.customer.email}</span>
                                 <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedOrder.customer.phone}</span>
                              </div>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3" /> Shipping Address</h4>
                              <p className="text-xs text-zinc-secondary leading-relaxed p-3 bg-obsidian-outer/30 rounded-sm border border-white/5">
                                 {selectedOrder.shippingAddress}
                              </p>
                           </div>
                           <div className="space-y-2">
                              <h4 className="text-[10px] font-black text-zinc-text uppercase tracking-widest flex items-center gap-2"><CreditCard className="w-3 h-3" /> Billing Address</h4>
                              <p className="text-xs text-zinc-secondary leading-relaxed p-3 bg-obsidian-outer/30 rounded-sm border border-white/5">
                                 {selectedOrder.billingAddress}
                              </p>
                           </div>
                        </div>
                     </div>
                  )}

                  {activeTab === 'timeline' && (
                     <div className="space-y-6 pl-2 animate-in fade-in slide-in-from-right-4">
                        {selectedOrder.timeline.map((event, idx) => (
                           <div key={event.id} className="relative pl-8 pb-2 last:pb-0">
                              {idx !== selectedOrder.timeline.length - 1 && (
                                 <div className="absolute left-[7px] top-2 bottom-[-24px] w-px bg-white/10" />
                              )}
                              <div className={cn("absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-obsidian-panel flex items-center justify-center bg-obsidian-outer", event.color.replace('text-', 'bg-'))}>
                                 <div className="w-1.5 h-1.5 rounded-full bg-obsidian-panel" />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-zinc-text">{event.title}</p>
                                 <p className="text-[10px] text-zinc-muted mt-0.5">{event.desc}</p>
                                 <p className="text-[9px] font-mono text-zinc-muted/60 uppercase mt-1">{event.date}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         )}
      </AmberSlideOver>
    </div>
  );
};
