
import React, { useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Dropdown } from '../components/ui/Dropdown';
import { SlideOver } from '../components/ui/SlideOver';
import { Autocomplete } from '../components/ui/Autocomplete';
import { 
  ShoppingCart, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Truck, 
  DollarSign,
  AlertCircle,
  Package,
  User,
  CreditCard,
  MapPin,
  Calendar,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/cn';

export const Orders = () => {
  const { t } = useLanguage();
  
  // -- View State --
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFulfillment, setFilterFulfillment] = useState('all');
  const [sortConfig, setSortConfig] = useState('date_desc');
  const [searchQuery, setSearchQuery] = useState('');
  
  // -- Modal State --
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // -- Advanced Filter State --
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Form State
  const [formData, setFormData] = useState({
    customer: '',
    category: '',
    style: '',
    priority: 'Standard'
  });

  const ordersData = [
    { id: 'ORD-2025-001', customer: 'Acme Corp', date: '2025-05-20', total: '$4,290.00', status: 'Paid', fulfillment: 'Fulfilled' },
    { id: 'ORD-2025-002', customer: 'Globex Inc', date: '2025-05-19', total: '$1,150.00', status: 'Pending', fulfillment: 'Processing' },
    { id: 'ORD-2025-003', customer: 'Soylent Corp', date: '2025-05-19', total: '$890.50', status: 'Paid', fulfillment: 'Shipped' },
    { id: 'ORD-2025-004', customer: 'Initech', date: '2025-05-18', total: '$12,400.00', status: 'Paid', fulfillment: 'Fulfilled' },
    { id: 'ORD-2025-005', customer: 'Umbrella Corp', date: '2025-05-18', total: '$3,200.00', status: 'Failed', fulfillment: 'Cancelled' },
    { id: 'ORD-2025-006', customer: 'Stark Ind', date: '2025-05-17', total: '$55,000.00', status: 'Paid', fulfillment: 'Processing' },
  ];

  // Helper to parse currency string
  const parsePrice = (priceStr: string) => parseFloat(priceStr.replace(/[^0-9.-]+/g,""));

  // Logic: Filter & Sort
  const processedOrders = useMemo(() => {
    let result = ordersData.filter(order => {
        // 1. Basic Search
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              order.customer.toLowerCase().includes(searchQuery.toLowerCase());
        
        // 2. Dropdown Filters
        const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();
        const matchesFulfillment = filterFulfillment === 'all' || order.fulfillment.toLowerCase() === filterFulfillment.toLowerCase();
    
        // 3. Advanced Filters (Date)
        const orderDate = new Date(order.date).getTime();
        const matchesDateStart = dateRange.start ? orderDate >= new Date(dateRange.start).getTime() : true;
        const matchesDateEnd = dateRange.end ? orderDate <= new Date(dateRange.end).getTime() : true;

        // 4. Advanced Filters (Price)
        const orderPrice = parsePrice(order.total);
        const matchesPriceMin = priceRange.min ? orderPrice >= parseFloat(priceRange.min) : true;
        const matchesPriceMax = priceRange.max ? orderPrice <= parseFloat(priceRange.max) : true;

        return matchesSearch && matchesStatus && matchesFulfillment && matchesDateStart && matchesDateEnd && matchesPriceMin && matchesPriceMax;
    });

    return result.sort((a, b) => {
        switch (sortConfig) {
            case 'date_desc':
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            case 'date_asc':
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            case 'total_high':
                return parsePrice(b.total) - parsePrice(a.total);
            case 'total_low':
                return parsePrice(a.total) - parsePrice(b.total);
            case 'cust_az':
                return a.customer.localeCompare(b.customer);
            default:
                return 0;
        }
    });
  }, [ordersData, searchQuery, filterStatus, filterFulfillment, sortConfig, dateRange, priceRange]);

  const resetFilters = () => {
    setFilterStatus('all');
    setFilterFulfillment('all');
    setDateRange({ start: '', end: '' });
    setPriceRange({ min: '', max: '' });
    setSearchQuery('');
  };

  // Mock Data for Autocomplete
  const customers = [
    { label: 'Acme Corporation', value: 'acme', subtext: 'Enterprise - Tier 1' },
    { label: 'Wayne Enterprises', value: 'wayne', subtext: 'Enterprise - Tier 1' },
    { label: 'Stark Industries', value: 'stark', subtext: 'Government Contract' },
    { label: 'Cyberdyne Systems', value: 'cyber', subtext: 'R&D Dept' },
  ];

  const categories = [
    { label: 'Electronics', value: 'electronics' },
    { label: 'Apparel & Gear', value: 'apparel' },
    { label: 'Office Furniture', value: 'furniture' },
    { label: 'Software Licenses', value: 'software' },
  ];

  const styles = [
    { label: 'Bulk Shipment (Pallet)', value: 'pallet' },
    { label: 'Individual Units', value: 'units' },
    { label: 'Digital Key Transfer', value: 'digital' },
    { label: 'Dropship Direct', value: 'dropship' },
  ];

  const sortOptions = [
    { label: 'Date: Newest', value: 'date_desc' },
    { label: 'Date: Oldest', value: 'date_asc' },
    { label: 'Total: High to Low', value: 'total_high' },
    { label: 'Total: Low to High', value: 'total_low' },
    { label: 'Customer: A-Z', value: 'cust_az' },
  ];

  return (
    <div className="animate-fade-up space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-text uppercase italic tracking-tighter">{t('orders.title')}</h1>
          <p className="text-sm text-zinc-muted font-medium mt-1">{t('orders.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-zinc-muted hover:text-zinc-text">
            <Download className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0" /> {t('orders.export')}
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-2 rtl:ml-2 rtl:mr-0" /> {t('orders.new')}
          </Button>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('orders.stat.revenue'), value: '$1.2M', trend: '+12.5%', icon: DollarSign, color: 'text-brand' },
          { label: t('orders.stat.active'), value: '142', trend: 'Processing', icon: ShoppingCart, color: 'text-info' },
          { label: t('orders.stat.pending'), value: '89', trend: 'High Load', icon: Clock, color: 'text-warning' },
          { label: t('orders.stat.returns'), value: '2.4%', trend: 'Nominal', icon: AlertCircle, color: 'text-danger' },
        ].map((stat, i) => (
          <Card key={i} className="p-5 hover:border-brand/20 transition-all cursor-default group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-wider mb-1 group-hover:text-brand transition-colors">{stat.label}</p>
                <p className="text-xl font-black text-zinc-text tracking-tighter">{stat.value}</p>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-tight",
                  stat.color.replace('text-', 'text-')
                )}>{stat.trend}</span>
              </div>
              <div className={cn("p-2 rounded-sm bg-obsidian-outer border border-white/5", stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 3. Filters & Sort Section */}
      <div className="bg-obsidian-panel border border-white/10 rounded-sm p-4 flex flex-col lg:flex-row gap-4 items-end relative z-10">
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 px-1">
            Global Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
            <input 
              type="text" 
              placeholder={t('orders.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 rtl:pr-10 rtl:pl-4 text-sm outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/50"
            />
          </div>
        </div>
        
        <div className="w-full lg:w-48">
            <label className="block text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-1.5 px-1">Sort Order</label>
            <Dropdown 
                options={sortOptions} 
                value={sortConfig} 
                onChange={setSortConfig} 
                className="w-full"
            />
        </div>

        <Dropdown 
          label={t('orders.filter.status')} 
          options={[
            {label: t('label.all'), value: 'all'},
            {label: 'Paid', value: 'paid'},
            {label: 'Pending', value: 'pending'},
            {label: 'Failed', value: 'failed'}
          ]} 
          value={filterStatus} 
          onChange={setFilterStatus} 
          className="w-full lg:w-48"
        />

        <Dropdown 
          label={t('orders.filter.fulfillment')} 
          options={[
            {label: t('label.all'), value: 'all'},
            {label: 'Fulfilled', value: 'fulfilled'},
            {label: 'Processing', value: 'processing'},
            {label: 'Shipped', value: 'shipped'},
            {label: 'Cancelled', value: 'cancelled'}
          ]} 
          value={filterFulfillment} 
          onChange={setFilterFulfillment} 
          className="w-full lg:w-48"
        />
        
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="h-10 px-4 bg-obsidian-card border border-white/5 text-zinc-muted hover:text-zinc-text transition-all rounded-sm flex items-center justify-center hover:bg-white/5"
          title="Advanced Filters"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Data Table */}
      <Card noPadding className="border-white/10 shadow-2xl bg-obsidian-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-obsidian-outer/30 border-b border-white/5">
                <th className="px-6 py-4 text-start text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('orders.table.id')}</th>
                <th className="px-6 py-4 text-start text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('orders.table.customer')}</th>
                <th className="px-6 py-4 text-start text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('orders.table.date')}</th>
                <th className="px-6 py-4 text-start text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('orders.table.total')}</th>
                <th className="px-6 py-4 text-start text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('orders.table.status')}</th>
                <th className="px-6 py-4 text-start text-[10px] font-black text-zinc-muted uppercase tracking-widest">{t('orders.table.fulfillment')}</th>
                <th className="px-6 py-4 text-end"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {processedOrders.length > 0 ? (
                processedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-3">
                       <span className="font-mono text-xs font-bold text-zinc-muted group-hover:text-brand transition-colors">{order.id}</span>
                    </td>
                    <td className="px-6 py-3">
                       <span className="text-sm font-bold text-zinc-text">{order.customer}</span>
                    </td>
                    <td className="px-6 py-3">
                       <span className="text-[11px] font-bold text-zinc-muted">{order.date}</span>
                    </td>
                    <td className="px-6 py-3">
                       <span className="text-sm font-bold text-zinc-text">{order.total}</span>
                    </td>
                    <td className="px-6 py-3">
                       <div className="flex items-center gap-2">
                          {order.status === 'Paid' && <CheckCircle className="w-3.5 h-3.5 text-success" />}
                          {order.status === 'Pending' && <Clock className="w-3.5 h-3.5 text-warning" />}
                          {order.status === 'Failed' && <XCircle className="w-3.5 h-3.5 text-danger" />}
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-tight",
                            order.status === 'Paid' ? 'text-success' : order.status === 'Pending' ? 'text-warning' : 'text-danger'
                          )}>{order.status}</span>
                       </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={cn(
                        "text-[9px] font-black px-2.5 py-1 rounded-sm border uppercase tracking-[0.15em] inline-flex items-center gap-1.5",
                        order.fulfillment === 'Fulfilled' || order.fulfillment === 'Shipped' ? 'bg-success/5 text-success border-success/20' : 
                        order.fulfillment === 'Cancelled' ? 'bg-zinc-muted/5 text-zinc-muted border-white/10' : 
                        'bg-info/5 text-info border-info/20'
                      )}>
                        {order.fulfillment === 'Shipped' && <Truck className="w-3 h-3" />}
                        {order.fulfillment}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-end">
                       <button className="p-2 text-zinc-muted hover:text-zinc-text transition-colors"><MoreVertical className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-zinc-muted text-xs italic">
                    No orders found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Footer */}
        <div className="bg-obsidian-outer/30 px-6 py-4 border-t border-white/5 flex items-center justify-between">
           <p className="text-[10px] text-zinc-muted font-black uppercase tracking-[0.2em]">Showing {processedOrders.length} Records</p>
           <div className="flex gap-2">
             <button disabled className="px-4 py-1.5 text-[10px] font-black text-zinc-muted bg-obsidian-card border border-white/5 rounded-sm opacity-50 uppercase tracking-widest">Previous</button>
             <button className="px-4 py-1.5 text-[10px] font-black text-zinc-text bg-obsidian-card border border-white/5 rounded-sm hover:bg-obsidian-hover hover:border-brand/30 transition-all uppercase tracking-widest">Next</button>
           </div>
        </div>
      </Card>

      {/* Advanced Filters SlideOver */}
      <SlideOver
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Advanced Filters"
        description="Refine your search with granular constraints."
        footer={
            <>
                <Button variant="ghost" onClick={resetFilters}>
                    <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
                </Button>
                <Button onClick={() => setIsFilterOpen(false)}>
                    View {processedOrders.length} Results
                </Button>
            </>
        }
      >
        <div className="space-y-6">
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Calendar className="w-4 h-4 text-brand" />
                    <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Date Range</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Start Date</label>
                        <input 
                            type="date" 
                            value={dateRange.start}
                            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                            className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30" 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">End Date</label>
                        <input 
                            type="date" 
                            value={dateRange.end}
                            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                            className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30" 
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <DollarSign className="w-4 h-4 text-brand" />
                    <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Price Range</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Min Amount ($)</label>
                        <input 
                            type="number" 
                            placeholder="0.00"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                            className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30" 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Max Amount ($)</label>
                        <input 
                            type="number" 
                            placeholder="Max"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                            className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30" 
                        />
                    </div>
                </div>
            </section>
        </div>
      </SlideOver>

      {/* Create Order SlideOver - Content Remains Same */}
      <SlideOver
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Order"
        description="Initialize a new transaction record manually."
        footer={
            <>
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button>Initialize Order</Button>
            </>
        }
      >
        <div className="space-y-8">
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <User className="w-4 h-4 text-brand" />
                    <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Customer Information</h3>
                </div>
                <Autocomplete 
                    label="Select Account"
                    placeholder="Search customers..."
                    options={customers}
                    value={formData.customer}
                    onChange={(val) => setFormData({...formData, customer: val})}
                />
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Contact Email</label>
                        <input type="email" disabled value={formData.customer === 'acme' ? 'billing@acme.corp' : ''} className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs text-zinc-muted cursor-not-allowed" placeholder="Auto-filled..." />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Region</label>
                        <div className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 flex items-center text-xs text-zinc-muted">
                            {formData.customer ? 'North America (NA-East)' : '-'}
                        </div>
                    </div>
                </div>
            </section>
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Package className="w-4 h-4 text-brand" />
                    <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Line Items</h3>
                </div>
                <div className="p-4 bg-obsidian-outer/30 rounded-sm border border-white/5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Autocomplete 
                            label="Product Category"
                            placeholder="Filter Category..."
                            options={categories}
                            value={formData.category}
                            onChange={(val) => setFormData({...formData, category: val})}
                        />
                         <Autocomplete 
                            label="Fulfillment Style"
                            placeholder="Select Type..."
                            options={styles}
                            value={formData.style}
                            onChange={(val) => setFormData({...formData, style: val})}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">SKU Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-muted" />
                            <input type="text" placeholder="Search product catalog..." className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-9 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 transition-all" />
                        </div>
                    </div>
                </div>
                <Button variant="secondary" size="sm" className="w-full border-dashed border-white/10 hover:border-brand/30 hover:bg-brand/5 hover:text-brand">
                    <Plus className="w-4 h-4 mr-2" /> Add Line Item
                </Button>
            </section>
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <CreditCard className="w-4 h-4 text-brand" />
                    <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Payment & Logistics</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Payment Method</label>
                        <select className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 appearance-none">
                            <option>Corporate Invoice (Net-30)</option>
                            <option>Credit Card (Stripe)</option>
                            <option>Wire Transfer</option>
                        </select>
                    </div>
                     <div className="space-y-1.5">
                        <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Priority</label>
                        <select 
                            className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 appearance-none"
                            value={formData.priority}
                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        >
                            <option>Standard Ground</option>
                            <option>Express Air</option>
                            <option>Overnight Critical</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="block text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Shipping Address</label>
                    <div className="flex gap-2">
                        <div className="w-10 h-10 bg-obsidian-outer border border-white/5 flex items-center justify-center shrink-0 rounded-sm">
                            <MapPin className="w-4 h-4 text-zinc-muted" />
                        </div>
                        <input type="text" placeholder="Street Address, City, Postal Code" className="flex-1 h-10 bg-obsidian-outer border border-white/5 rounded-sm px-3 text-xs font-bold text-zinc-text outline-none focus:border-brand/30" />
                    </div>
                </div>
            </section>
        </div>
      </SlideOver>
    </div>
  );
};
