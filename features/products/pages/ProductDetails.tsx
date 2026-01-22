
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { 
  ArrowLeft, Edit, Copy, Trash2, TrendingUp, MoreVertical, 
  Package, DollarSign, Activity, Star, History, Box, 
  MapPin, AlertTriangle, CheckCircle2, Truck, Tag, Layers,
  ChevronRight, Calendar, User, Plus, FileText
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { paths } from '../../../routes/paths';

// --- Mock Data ---
const PRODUCT = {
  id: 'SKU-8821',
  name: 'Premium Wireless Headphones v2',
  description: 'Experience high-fidelity audio with our latest Neural-Link technology. These headphones feature active noise cancellation, 40-hour battery life, and ultra-low latency connectivity suitable for professional gaming and studio work.',
  category: 'Electronics',
  brand: 'ZoneVast',
  status: 'Active',
  price: 299.00,
  comparePrice: 349.00,
  cost: 180.00,
  taxClass: 'Standard Rate',
  stock: 48,
  stockStatus: 'In Stock',
  lowStockThreshold: 10,
  images: [1, 2, 3, 4], // Placeholders
  warehouses: [
    { name: 'US-East (New York)', stock: 32 },
    { name: 'EU-Central (Berlin)', stock: 12 },
    { name: 'Asia-Pac (Tokyo)', stock: 4 }
  ],
  variants: [
    { id: 'v1', name: 'Midnight Black', sku: 'SKU-8821-BLK', price: 299.00, stock: 24 },
    { id: 'v2', name: 'Lunar White', sku: 'SKU-8821-WHT', price: 299.00, stock: 18 },
    { id: 'v3', name: 'Nebula Blue', sku: 'SKU-8821-BLU', price: 319.00, stock: 6 },
  ],
  reviews: [
    { id: 'r1', user: 'Sarah Jenkins', rating: 5, date: '2 days ago', text: 'Absolutely stunning sound quality. The noise cancellation is top tier.' },
    { id: 'r2', user: 'Mike Ross', rating: 4, date: '1 week ago', text: 'Great headphones, but the app connectivity could be faster.' },
    { id: 'r3', user: 'Elena Fisher', rating: 5, date: '2 weeks ago', text: 'Perfect for travel. Battery lasts forever.' }
  ],
  history: [
    { id: 'h1', action: 'Stock Adjustment', detail: '+50 units added to US-East', user: 'Alex Morgan', date: 'Yesterday at 14:30' },
    { id: 'h2', action: 'Price Update', detail: 'Changed from $289.00 to $299.00', user: 'System', date: 'May 18, 2025' },
    { id: 'h3', action: 'Product Created', detail: 'Initial draft created', user: 'Alex Morgan', date: 'May 10, 2025' }
  ]
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: FileText },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'history', label: 'History', icon: History },
];

export const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(0);

  // Profit Calculation
  const profit = PRODUCT.price - PRODUCT.cost;
  const margin = ((profit / PRODUCT.price) * 100).toFixed(1);

  return (
    <div className="animate-fade-up max-w-[1600px] mx-auto py-6 space-y-8">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => navigate(paths.catalog)}
            className="p-2 bg-white/5 rounded-sm hover:bg-white/10 text-zinc-muted hover:text-zinc-text transition-colors mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">Catalog</span>
               <ChevronRight className="w-3 h-3 text-zinc-muted" />
               <span className="text-[10px] font-bold text-brand uppercase tracking-widest">{PRODUCT.category}</span>
            </div>
            <h1 className="text-3xl font-black text-zinc-text uppercase italic tracking-tighter">{PRODUCT.name}</h1>
            <div className="flex items-center gap-4 mt-2">
               <span className="font-mono text-xs font-bold text-zinc-muted bg-white/5 px-2 py-0.5 rounded-sm border border-white/5">{PRODUCT.id}</span>
               <span className={cn(
                 "text-[10px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest flex items-center gap-1.5",
                 PRODUCT.status === 'Active' ? 'bg-success/10 text-success border-success/20' : 'bg-zinc-muted/10 text-zinc-muted border-white/10'
               )}>
                 <div className={cn("w-1.5 h-1.5 rounded-full", PRODUCT.status === 'Active' ? "bg-success animate-pulse" : "bg-zinc-muted")} />
                 {PRODUCT.status}
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <AmberButton variant="ghost" size="sm">
              <TrendingUp className="w-3.5 h-3.5 mr-2" /> Analytics
           </AmberButton>
           <AmberButton variant="secondary" size="sm">
              <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
           </AmberButton>
           <AmberButton size="sm">
              <Edit className="w-3.5 h-3.5 mr-2" /> Edit Product
           </AmberButton>
           <div className="w-px h-8 bg-white/5 mx-2" />
           <button className="p-2.5 text-zinc-muted hover:text-danger bg-white/5 hover:bg-danger/10 rounded-sm transition-all border border-white/5 hover:border-danger/20">
              <Trash2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* 2. Main Grid: Gallery & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Left: Gallery */}
         <div className="lg:col-span-4 space-y-4">
            <AmberCard noPadding className="aspect-square bg-obsidian-outer flex items-center justify-center relative overflow-hidden group border-white/10">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <span className="text-4xl font-black text-white/5 select-none">IMG {selectedImage + 1}</span>
               {/* Placeholder for actual image */}
               {/* <img src={PRODUCT.images[selectedImage]} className="w-full h-full object-cover" /> */}
            </AmberCard>
            <div className="grid grid-cols-4 gap-4">
               {PRODUCT.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                       "aspect-square rounded-sm border bg-obsidian-outer flex items-center justify-center transition-all",
                       selectedImage === idx ? "border-brand ring-1 ring-brand/50" : "border-white/5 hover:border-white/20"
                    )}
                  >
                     <span className="text-[10px] font-black text-zinc-muted">IMG {idx + 1}</span>
                  </button>
               ))}
            </div>
         </div>

         {/* Right: Key Stats & Quick Info */}
         <div className="lg:col-span-8 flex flex-col h-full">
            <AmberCard className="flex-1 p-8 space-y-8 bg-obsidian-panel/60" glass>
               {/* Price Row */}
               <div className="flex items-end justify-between border-b border-white/5 pb-6">
                  <div>
                     <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-1">Selling Price</p>
                     <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-black text-zinc-text tracking-tighter">${PRODUCT.price.toFixed(2)}</span>
                        <span className="text-lg font-bold text-zinc-muted line-through decoration-danger decoration-2">${PRODUCT.comparePrice.toFixed(2)}</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest mb-1">Profit Margin</p>
                     <div className="flex items-center justify-end gap-2">
                        <span className="text-xl font-bold text-success">+{margin}%</span>
                        <span className="text-xs font-medium text-zinc-muted">(${profit.toFixed(2)} / unit)</span>
                     </div>
                  </div>
               </div>

               {/* Stats Grid */}
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm">
                     <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-brand" />
                        <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Total Stock</span>
                     </div>
                     <span className="text-2xl font-bold text-zinc-text">{PRODUCT.stock}</span>
                     <p className="text-[9px] text-zinc-muted mt-1">Across 3 locations</p>
                  </div>
                  <div className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm">
                     <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-4 h-4 text-info" />
                        <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Brand</span>
                     </div>
                     <span className="text-xl font-bold text-zinc-text">{PRODUCT.brand}</span>
                  </div>
                  <div className="p-4 bg-obsidian-outer/50 border border-white/5 rounded-sm">
                     <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-warning" />
                        <span className="text-[10px] font-black text-zinc-muted uppercase tracking-widest">Velocity</span>
                     </div>
                     <span className="text-xl font-bold text-zinc-text">High</span>
                     <p className="text-[9px] text-zinc-muted mt-1">14 sales / day</p>
                  </div>
               </div>

               {/* Description Snippet */}
               <div className="space-y-2">
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest">Quick Summary</h3>
                  <p className="text-sm font-medium text-zinc-secondary leading-relaxed max-w-2xl">
                     {PRODUCT.description}
                  </p>
               </div>
            </AmberCard>
         </div>
      </div>

      {/* 3. Tab Navigation */}
      <div className="border-b border-white/5">
         <div className="flex gap-8 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                     "flex items-center gap-2 pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap",
                     activeTab === tab.id ? "text-brand" : "text-zinc-muted hover:text-zinc-text"
                  )}
               >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                     <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand animate-in fade-in zoom-in duration-300" />
                  )}
               </button>
            ))}
         </div>
      </div>

      {/* 4. Tab Content */}
      <div className="min-h-[400px]">
         
         {/* OVERVIEW TAB */}
         {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="lg:col-span-2 space-y-6">
                  <AmberCard className="p-6 space-y-4">
                     <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest border-b border-white/5 pb-2">Detailed Description</h3>
                     <div className="prose prose-invert prose-sm max-w-none text-zinc-secondary">
                        <p>{PRODUCT.description}</p>
                        <p>Additional marketing copy would go here, utilizing rich text formatting for lists, bold text, and embedded media.</p>
                        <ul className="list-disc pl-4 space-y-1 mt-2">
                           <li>Active Noise Cancellation (ANC)</li>
                           <li>Transparency Mode</li>
                           <li>40-hour Battery Life</li>
                           <li>USB-C Fast Charging</li>
                        </ul>
                     </div>
                  </AmberCard>
               </div>
               <div className="space-y-6">
                  <AmberCard className="p-6">
                     <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4">Specifications</h3>
                     <div className="space-y-3">
                        <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                           <span className="text-zinc-muted">Weight</span>
                           <span className="font-bold text-zinc-text">250g</span>
                        </div>
                        <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                           <span className="text-zinc-muted">Connectivity</span>
                           <span className="font-bold text-zinc-text">Bluetooth 5.2</span>
                        </div>
                        <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                           <span className="text-zinc-muted">Material</span>
                           <span className="font-bold text-zinc-text">Aluminum / Leather</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-zinc-muted">Warranty</span>
                           <span className="font-bold text-zinc-text">2 Years</span>
                        </div>
                     </div>
                  </AmberCard>
               </div>
            </div>
         )}

         {/* INVENTORY TAB */}
         {activeTab === 'inventory' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PRODUCT.warehouses.map((wh, i) => (
                     <AmberCard key={i} className="p-5 border-l-2 border-l-brand flex items-center justify-between">
                        <div>
                           <p className="text-[9px] font-black text-zinc-muted uppercase tracking-widest mb-1">{wh.name}</p>
                           <p className="text-2xl font-bold text-zinc-text">{wh.stock}</p>
                        </div>
                        <div className="p-2 bg-obsidian-outer rounded-sm">
                           <MapPin className="w-5 h-5 text-zinc-muted" />
                        </div>
                     </AmberCard>
                  ))}
               </div>

               <AmberCard className="p-0 overflow-hidden">
                  <div className="p-5 border-b border-white/5 flex justify-between items-center">
                     <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-4 h-4 text-zinc-muted" /> Variants
                     </h3>
                     <AmberButton size="sm" variant="secondary"><Plus className="w-3.5 h-3.5 mr-2" /> Add Variant</AmberButton>
                  </div>
                  <table className="w-full text-left">
                     <thead className="bg-obsidian-outer/50 text-[9px] font-black text-zinc-muted uppercase tracking-widest">
                        <tr>
                           <th className="px-6 py-3">Variant Name</th>
                           <th className="px-6 py-3">SKU</th>
                           <th className="px-6 py-3">Price</th>
                           <th className="px-6 py-3">Stock</th>
                           <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5 text-xs font-medium">
                        {PRODUCT.variants.map((v) => (
                           <tr key={v.id} className="hover:bg-white/[0.02]">
                              <td className="px-6 py-4 font-bold text-zinc-text">{v.name}</td>
                              <td className="px-6 py-4 font-mono text-zinc-secondary">{v.sku}</td>
                              <td className="px-6 py-4">${v.price.toFixed(2)}</td>
                              <td className="px-6 py-4">
                                 <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", v.stock < 10 ? "bg-danger/10 text-danger" : "bg-success/10 text-success")}>
                                    {v.stock} units
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button className="text-zinc-muted hover:text-brand"><Edit className="w-3.5 h-3.5" /></button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </AmberCard>
            </div>
         )}

         {/* PRICING TAB */}
         {activeTab === 'pricing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <AmberCard className="p-6 space-y-6">
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Price Configuration</h3>
                  <div className="grid grid-cols-2 gap-6">
                     <AmberInput label="Selling Price" value={PRODUCT.price} type="number" icon={<span className="text-zinc-muted font-bold">$</span>} />
                     <AmberInput label="Compare At" value={PRODUCT.comparePrice} type="number" icon={<span className="text-zinc-muted font-bold">$</span>} />
                     <AmberInput label="Cost Per Item" value={PRODUCT.cost} type="number" icon={<span className="text-zinc-muted font-bold">$</span>} />
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-zinc-muted uppercase tracking-widest px-1">Tax Class</label>
                        <select className="w-full h-11 bg-obsidian-outer border border-white/5 rounded-sm px-4 text-sm text-zinc-text outline-none focus:border-brand/30">
                           <option>Standard Rate</option>
                           <option>Reduced Rate</option>
                           <option>Tax Free</option>
                        </select>
                     </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                     <AmberButton size="sm">Update Pricing</AmberButton>
                  </div>
               </AmberCard>

               <AmberCard className="p-6 bg-obsidian-panel/40">
                  <h3 className="text-xs font-black text-zinc-text uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Margin Analysis</h3>
                  <div className="space-y-6">
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-zinc-muted">Profit per Unit</span>
                        <span className="text-2xl font-black text-success">${profit.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-zinc-muted">Margin</span>
                        <span className="text-2xl font-black text-brand">{margin}%</span>
                     </div>
                     <div className="p-4 bg-obsidian-outer border border-white/5 rounded-sm">
                        <p className="text-[10px] font-bold text-zinc-muted uppercase mb-2">Break-even Volume</p>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                           <div className="bg-info h-full w-[45%]" />
                        </div>
                        <p className="text-[9px] text-zinc-muted mt-2 text-right">45% to target</p>
                     </div>
                  </div>
               </AmberCard>
            </div>
         )}

         {/* REVIEWS TAB */}
         {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="lg:col-span-1 space-y-6">
                  <AmberCard className="p-6 text-center">
                     <h2 className="text-5xl font-black text-zinc-text tracking-tighter">4.8</h2>
                     <div className="flex justify-center gap-1 text-brand my-2">
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current opacity-50" />
                     </div>
                     <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest">Based on 128 Reviews</p>
                  </AmberCard>
                  <AmberButton className="w-full">
                     <Plus className="w-4 h-4 mr-2" /> Add Internal Note
                  </AmberButton>
               </div>
               
               <div className="lg:col-span-2 space-y-4">
                  {PRODUCT.reviews.map((review) => (
                     <AmberCard key={review.id} className="p-5">
                        <div className="flex justify-between items-start mb-3">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                                 {review.user.charAt(0)}
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-zinc-text">{review.user}</p>
                                 <div className="flex gap-0.5 text-brand text-[8px]">
                                    {Array.from({length: 5}).map((_, i) => (
                                       <Star key={i} className={cn("w-2.5 h-2.5", i < review.rating ? "fill-current" : "text-zinc-muted opacity-30")} />
                                    ))}
                                 </div>
                              </div>
                           </div>
                           <span className="text-[9px] font-mono text-zinc-muted">{review.date}</span>
                        </div>
                        <p className="text-sm text-zinc-secondary leading-relaxed italic">"{review.text}"</p>
                     </AmberCard>
                  ))}
               </div>
            </div>
         )}

         {/* HISTORY TAB */}
         {activeTab === 'history' && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="relative border-l border-white/10 ml-3 space-y-8 py-4">
                  {PRODUCT.history.map((event) => (
                     <div key={event.id} className="relative pl-8">
                        <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-brand border-2 border-obsidian-outer shadow-[0_0_0_4px_rgba(255,255,255,0.05)]" />
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                           <h4 className="text-sm font-bold text-zinc-text">{event.action}</h4>
                           <span className="text-[10px] font-mono text-zinc-muted uppercase">{event.date}</span>
                        </div>
                        <p className="text-xs text-zinc-secondary mb-2">{event.detail}</p>
                        <div className="flex items-center gap-2">
                           <User className="w-3 h-3 text-zinc-muted" />
                           <span className="text-[10px] font-bold text-zinc-muted uppercase tracking-wider">{event.user}</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

      </div>
    </div>
  );
};
