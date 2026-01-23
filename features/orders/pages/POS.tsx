
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AmberCard } from '../../../amber-ui/components/AmberCard';
import { AmberButton } from '../../../amber-ui/components/AmberButton';
import { AmberInput } from '../../../amber-ui/components/AmberInput';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ScanBarcode, 
  User, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Clock, 
  RefreshCw,
  X,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../../lib/cn';

// --- Types ---
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  color: string; // Placeholder for image
}

interface CartItem extends Product {
  qty: number;
}

// --- Mock Data ---
const PRODUCTS: Product[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `P-${100 + i}`,
  name: [
    'Wireless Headphones', 'Mechanical Keyboard', 'Gaming Mouse', 'USB-C Hub', 
    'Monitor Stand', 'Webcam 4K', 'Desk Mat', 'Screen Cleaner',
    'Laptop Sleeve', 'Power Bank 20k', 'HDMI Cable', 'Ergo Chair'
  ][i % 12] + (i > 11 ? ' Pro' : ''),
  sku: `SKU-${8000 + i}`,
  price: Math.floor(Math.random() * 200) + 20,
  stock: Math.floor(Math.random() * 50) + 5,
  category: ['Electronics', 'Accessories', 'Furniture', 'Cables'][i % 4],
  color: `hsl(${Math.random() * 360}, 60%, 25%)`
}));

const CUSTOMERS = [
  { id: 'guest', name: 'Walk-in Customer' },
  { id: 'c1', name: 'Alex Morgan' },
  { id: 'c2', name: 'Sarah Chen' },
  { id: 'c3', name: 'James Wilson' },
];

export const POS = () => {
  // State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(CUSTOMERS[0].id);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Other' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Derived
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = cartSubtotal * 0.08; // 8% Tax
  const total = Math.max(0, cartSubtotal + tax - discount);

  // Handlers
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    if (confirm('Are you sure you want to clear the cart?')) {
      setCart([]);
      setDiscount(0);
      setPaymentMethod(null);
    }
  };

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery) {
      // Simulate barcode scan logic - exact SKU match adds to cart
      const exactMatch = PRODUCTS.find(p => p.sku.toLowerCase() === searchQuery.toLowerCase());
      if (exactMatch) {
        addToCart(exactMatch);
        setSearchQuery(''); // Clear input for next scan
      }
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    // Simulate API
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1500);
  };

  const resetOrder = () => {
    setCart([]);
    setDiscount(0);
    setPaymentMethod(null);
    setIsSuccess(false);
    setSelectedCustomer('guest');
  };

  // Categories for filter
  const categories = ['All', ...Array.from(new Set(PRODUCTS.map(p => p.category)))];

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 animate-fade-up overflow-hidden">
      
      {/* LEFT PANEL: PRODUCT CATALOG */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 h-full">
        {/* Top Bar */}
        <AmberCard noPadding className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
           <div className="relative w-full sm:w-80">
              <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search or Scan SKU..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleBarcodeScan}
                className="w-full h-10 bg-obsidian-outer border border-white/5 rounded-sm pl-10 pr-4 text-sm font-bold text-zinc-text outline-none focus:border-brand/30 transition-all placeholder:text-zinc-muted/50"
                autoFocus
              />
           </div>
           
           <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
              {categories.map(cat => (
                 <button
                   key={cat}
                   onClick={() => setActiveCategory(cat)}
                   className={cn(
                      "px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
                      activeCategory === cat 
                        ? "bg-brand text-obsidian-outer border-brand" 
                        : "bg-obsidian-outer border-white/5 text-zinc-muted hover:text-zinc-text hover:border-white/10"
                   )}
                 >
                    {cat}
                 </button>
              ))}
           </div>
        </AmberCard>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
           <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
              {filteredProducts.map(product => (
                 <AmberCard 
                    key={product.id} 
                    className="group cursor-pointer hover:border-brand/30 transition-all p-0 overflow-hidden relative"
                    onClick={() => addToCart(product)}
                    noPadding
                 >
                    <div className="aspect-[4/3] bg-obsidian-outer relative flex items-center justify-center overflow-hidden">
                       <div className="absolute inset-0 opacity-80" style={{ backgroundColor: product.color }} />
                       <div className="relative z-10 p-2 bg-black/40 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                          <Plus className="w-6 h-6 text-white" />
                       </div>
                       <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-sm text-[10px] font-bold text-white">
                          ${product.price}
                       </div>
                    </div>
                    <div className="p-3">
                       <h3 className="text-xs font-bold text-zinc-text truncate">{product.name}</h3>
                       <div className="flex justify-between items-center mt-1">
                          <span className="text-[9px] font-mono text-zinc-muted">{product.sku}</span>
                          <span className={cn("text-[9px] font-bold", product.stock < 10 ? "text-warning" : "text-success")}>
                             {product.stock} left
                          </span>
                       </div>
                    </div>
                 </AmberCard>
              ))}
              {filteredProducts.length === 0 && (
                 <div className="col-span-full flex flex-col items-center justify-center h-64 text-zinc-muted opacity-50">
                    <Package className="w-12 h-12 mb-3 stroke-1" />
                    <p className="text-xs uppercase tracking-widest">No products found</p>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* RIGHT PANEL: CART */}
      <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 flex flex-col h-full bg-obsidian-panel border border-white/5 shadow-2xl rounded-lg overflow-hidden relative">
         
         {/* Success Overlay */}
         {isSuccess && (
            <div className="absolute inset-0 z-50 bg-obsidian-panel/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
               <div className="w-20 h-20 rounded-full bg-success/10 border-2 border-success flex items-center justify-center mb-6 text-success animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
               </div>
               <h2 className="text-3xl font-black text-zinc-text uppercase italic tracking-tighter mb-2">Order Complete</h2>
               <p className="text-sm font-bold text-zinc-muted uppercase tracking-widest mb-8">Receipt #POS-{Math.floor(Date.now()/1000)}</p>
               <div className="flex gap-4 w-full">
                  <AmberButton variant="secondary" className="flex-1" onClick={resetOrder}>Print Receipt</AmberButton>
                  <AmberButton className="flex-1" onClick={resetOrder}>New Order</AmberButton>
               </div>
            </div>
         )}

         {/* Processing Overlay */}
         {isProcessing && (
            <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
               <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
               <p className="text-xs font-black text-white uppercase tracking-[0.2em] animate-pulse">Processing Payment...</p>
            </div>
         )}

         {/* Cart Header */}
         <div className="p-4 bg-obsidian-outer border-b border-white/5 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-brand">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-sm font-black uppercase tracking-widest">Current Order</span>
               </div>
               <button className="text-[9px] font-bold text-zinc-muted hover:text-warning uppercase tracking-widest flex items-center gap-1 hover:bg-white/5 px-2 py-1 rounded-sm transition-colors">
                  <Clock className="w-3 h-3" /> Hold Order
               </button>
            </div>
            
            <div className="relative group">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted group-focus-within:text-brand" />
               <select 
                  className="w-full h-10 bg-obsidian-panel border border-white/10 rounded-sm pl-10 pr-4 text-xs font-bold text-zinc-text outline-none focus:border-brand/30 appearance-none cursor-pointer"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
               >
                  {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>
         </div>

         {/* Cart Items */}
         <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-obsidian-panel/50">
            {cart.length > 0 ? (
               cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-obsidian-outer/50 border border-white/5 rounded-sm group hover:border-white/10 transition-colors">
                     <div className="w-10 h-10 rounded-sm bg-obsidian-panel shrink-0" style={{ backgroundColor: item.color }} />
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-text truncate">{item.name}</p>
                        <p className="text-[10px] text-zinc-muted font-mono">${item.price.toFixed(2)}</p>
                     </div>
                     <div className="flex items-center gap-3 bg-obsidian-panel rounded-sm px-2 py-1 border border-white/5">
                        <button onClick={() => updateQty(item.id, -1)} className="text-zinc-muted hover:text-white"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="text-zinc-muted hover:text-white"><Plus className="w-3 h-3" /></button>
                     </div>
                     <div className="text-right min-w-[50px]">
                        <p className="text-xs font-bold text-zinc-text">${(item.price * item.qty).toFixed(2)}</p>
                     </div>
                     <button onClick={() => removeFromCart(item.id)} className="text-zinc-muted hover:text-danger p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                     </button>
                  </div>
               ))
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-zinc-muted opacity-40">
                  <ShoppingCart className="w-12 h-12 mb-3 stroke-1" />
                  <p className="text-xs uppercase tracking-widest">Cart is empty</p>
               </div>
            )}
         </div>

         {/* Cart Footer */}
         <div className="p-4 bg-obsidian-outer border-t border-white/5 space-y-4 shrink-0">
            <div className="space-y-2 text-xs">
               <div className="flex justify-between text-zinc-secondary">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-zinc-secondary">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center text-zinc-secondary">
                  <span>Discount</span>
                  <div className="w-20 relative">
                     <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px]">$</span>
                     <input 
                       type="number" 
                       value={discount} 
                       onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value)))}
                       className="w-full bg-obsidian-panel border border-white/10 rounded-sm py-1 pl-4 pr-1 text-right text-[10px] font-bold outline-none focus:border-brand/30"
                     />
                  </div>
               </div>
               <div className="h-px bg-white/10 my-2" />
               <div className="flex justify-between text-lg font-black text-zinc-text">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
               </div>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-3 gap-2">
               {[
                 { id: 'Cash', icon: Banknote },
                 { id: 'Card', icon: CreditCard },
                 { id: 'Other', icon: QrCode }
               ].map((m) => (
                  <button
                     key={m.id}
                     onClick={() => setPaymentMethod(m.id as any)}
                     className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-sm border transition-all",
                        paymentMethod === m.id 
                           ? "bg-brand/10 border-brand text-brand" 
                           : "bg-obsidian-panel border-white/5 text-zinc-muted hover:bg-white/5"
                     )}
                  >
                     <m.icon className="w-4 h-4 mb-1" />
                     <span className="text-[9px] font-bold uppercase">{m.id}</span>
                  </button>
               ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-4 gap-2">
               <button 
                  onClick={clearCart}
                  className="col-span-1 py-3 bg-danger/10 border border-danger/20 text-danger rounded-sm hover:bg-danger/20 transition-all flex items-center justify-center"
               >
                  <Trash2 className="w-4 h-4" />
               </button>
               <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || !paymentMethod}
                  className="col-span-3 py-3 bg-brand text-obsidian-outer text-sm font-black uppercase tracking-widest rounded-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand/10"
               >
                  Checkout <ArrowRight className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
