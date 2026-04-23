import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { cn } from '../lib/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface IconOption {
  name: string;
  icon: LucideIcon;
  category: string;
}

// Selected subset of useful category icons
const ICON_LIST: IconOption[] = [
  // E-Commerce
  { name: 'shopping-bag', icon: LucideIcons.ShoppingBag, category: 'E-Commerce' },
  { name: 'store', icon: LucideIcons.Store, category: 'E-Commerce' },
  { name: 'tag', icon: LucideIcons.Tag, category: 'E-Commerce' },
  { name: 'receipt', icon: LucideIcons.Receipt, category: 'E-Commerce' },
  { name: 'credit-card', icon: LucideIcons.CreditCard, category: 'E-Commerce' },
  { name: 'wallet', icon: LucideIcons.Wallet, category: 'E-Commerce' },
  { name: 'percent', icon: LucideIcons.Percent, category: 'E-Commerce' },
  { name: 'package', icon: LucideIcons.Package, category: 'E-Commerce' },
  { name: 'gift', icon: LucideIcons.Gift, category: 'E-Commerce' },
  { name: 'dollar-sign', icon: LucideIcons.DollarSign, category: 'E-Commerce' },

  // Electronics
  { name: 'smartphone', icon: LucideIcons.Smartphone, category: 'Electronics' },
  { name: 'laptop', icon: LucideIcons.Laptop, category: 'Electronics' },
  { name: 'watch', icon: LucideIcons.Watch, category: 'Electronics' },
  { name: 'headphones', icon: LucideIcons.Headphones, category: 'Electronics' },
  { name: 'camera', icon: LucideIcons.Camera, category: 'Electronics' },
  { name: 'gamepad-2', icon: LucideIcons.Gamepad2, category: 'Electronics' },
  { name: 'tv', icon: LucideIcons.Tv, category: 'Electronics' },
  { name: 'monitor', icon: LucideIcons.Monitor, category: 'Electronics' },
  { name: 'tablet', icon: LucideIcons.Tablet, category: 'Electronics' },
  { name: 'printer', icon: LucideIcons.Printer, category: 'Electronics' },

  // General
  { name: 'layout-grid', icon: LucideIcons.LayoutGrid, category: 'General' },
  { name: 'layers', icon: LucideIcons.Layers, category: 'General' },
  { name: 'grid-3x3', icon: LucideIcons.Grid3X3, category: 'General' },
  { name: 'list', icon: LucideIcons.List, category: 'General' },
  { name: 'star', icon: LucideIcons.Star, category: 'General' },
  { name: 'heart', icon: LucideIcons.Heart, category: 'General' },
  { name: 'gem', icon: LucideIcons.Gem, category: 'General' },
  { name: 'crown', icon: LucideIcons.Crown, category: 'General' },
  { name: 'award', icon: LucideIcons.Award, category: 'General' },
  { name: 'trophy', icon: LucideIcons.Trophy, category: 'General' },
  { name: 'medal', icon: LucideIcons.Medal, category: 'General' },
  { name: 'target', icon: LucideIcons.Target, category: 'General' },
  { name: 'zap', icon: LucideIcons.Zap, category: 'General' },
  { name: 'flame', icon: LucideIcons.Flame, category: 'General' },

  // Home & Fashion
  { name: 'home', icon: LucideIcons.Home, category: 'Home & Fashion' },
  { name: 'building', icon: LucideIcons.Building, category: 'Home & Fashion' },
  { name: 'building-2', icon: LucideIcons.Building2, category: 'Home & Fashion' },
  { name: 'warehouse', icon: LucideIcons.Warehouse, category: 'Home & Fashion' },
  { name: 'shirt', icon: LucideIcons.Shirt, category: 'Home & Fashion' },

  // Food & Drink
  { name: 'utensils', icon: LucideIcons.Utensils, category: 'Food & Drink' },
  { name: 'coffee', icon: LucideIcons.Coffee, category: 'Food & Drink' },
  { name: 'pizza', icon: LucideIcons.Pizza, category: 'Food & Drink' },
  { name: 'apple', icon: LucideIcons.Apple, category: 'Food & Drink' },
  { name: 'cake', icon: LucideIcons.Cake, category: 'Food & Drink' },
  { name: 'cookie', icon: LucideIcons.Cookie, category: 'Food & Drink' },
  { name: 'wine', icon: LucideIcons.Wine, category: 'Food & Drink' },
  { name: 'beer', icon: LucideIcons.Beer, category: 'Food & Drink' },

  // Nature
  { name: 'leaf', icon: LucideIcons.Leaf, category: 'Nature' },
  { name: 'sun', icon: LucideIcons.Sun, category: 'Nature' },
  { name: 'moon', icon: LucideIcons.Moon, category: 'Nature' },
  { name: 'mountain', icon: LucideIcons.Mountain, category: 'Nature' },
  { name: 'waves', icon: LucideIcons.Waves, category: 'Nature' },
  { name: 'tree-pine', icon: LucideIcons.TreePine, category: 'Nature' },
  { name: 'flower-2', icon: LucideIcons.Flower2, category: 'Nature' },
  { name: 'snowflake', icon: LucideIcons.Snowflake, category: 'Nature' },

  // Sports & Health
  { name: 'dumbbell', icon: LucideIcons.Dumbbell, category: 'Sports & Health' },
  { name: 'pill', icon: LucideIcons.Pill, category: 'Sports & Health' },
  { name: 'stethoscope', icon: LucideIcons.Stethoscope, category: 'Sports & Health' },
  { name: 'heart-pulse', icon: LucideIcons.HeartPulse, category: 'Sports & Health' },

  // Arts & Education
  { name: 'book-open', icon: LucideIcons.BookOpen, category: 'Arts & Education' },
  { name: 'palette', icon: LucideIcons.Palette, category: 'Arts & Education' },
  { name: 'music', icon: LucideIcons.Music, category: 'Arts & Education' },
  { name: 'pen-tool', icon: LucideIcons.PenTool, category: 'Arts & Education' },
  { name: 'pencil', icon: LucideIcons.Pencil, category: 'Arts & Education' },
  { name: 'scissors', icon: LucideIcons.Scissors, category: 'Arts & Education' },
  { name: 'paint-bucket', icon: LucideIcons.PaintBucket, category: 'Arts & Education' },

  // Tools
  { name: 'wrench', icon: LucideIcons.Wrench, category: 'Tools' },
  { name: 'hammer', icon: LucideIcons.Hammer, category: 'Tools' },
  { name: 'cog', icon: LucideIcons.Cog, category: 'Tools' },
  { name: 'drill', icon: LucideIcons.Drill, category: 'Tools' },
  { name: 'ruler', icon: LucideIcons.Ruler, category: 'Tools' },

  // Transport
  { name: 'car', icon: LucideIcons.Car, category: 'Transport' },
  { name: 'truck', icon: LucideIcons.Truck, category: 'Transport' },
  { name: 'plane', icon: LucideIcons.Plane, category: 'Transport' },
  { name: 'ship', icon: LucideIcons.Ship, category: 'Transport' },
  { name: 'bike', icon: LucideIcons.Bike, category: 'Transport' },
  { name: 'bus', icon: LucideIcons.Bus, category: 'Transport' },
  { name: 'train', icon: LucideIcons.TrainFront, category: 'Transport' },
  { name: 'compass', icon: LucideIcons.Compass, category: 'Transport' },

  // Location & World
  { name: 'map', icon: LucideIcons.Map, category: 'Location' },
  { name: 'globe', icon: LucideIcons.Globe, category: 'Location' },
  { name: 'map-pin', icon: LucideIcons.MapPin, category: 'Location' },

  // Tech
  { name: 'server', icon: LucideIcons.Server, category: 'Tech' },
  { name: 'database', icon: LucideIcons.Database, category: 'Tech' },
  { name: 'hard-drive', icon: LucideIcons.HardDrive, category: 'Tech' },
  { name: 'cpu', icon: LucideIcons.Cpu, category: 'Tech' },
  { name: 'wifi', icon: LucideIcons.Wifi, category: 'Tech' },
  { name: 'bluetooth', icon: LucideIcons.Bluetooth, category: 'Tech' },
  { name: 'scan', icon: LucideIcons.Scan, category: 'Tech' },
  { name: 'qr-code', icon: LucideIcons.QrCode, category: 'Tech' },

  // Security
  { name: 'shield', icon: LucideIcons.Shield, category: 'Security' },
  { name: 'shield-check', icon: LucideIcons.ShieldCheck, category: 'Security' },
  { name: 'lock', icon: LucideIcons.Lock, category: 'Security' },
  { name: 'key', icon: LucideIcons.Key, category: 'Security' },
  { name: 'fingerprint', icon: LucideIcons.Fingerprint, category: 'Security' },

  // Charts
  { name: 'bar-chart-3', icon: LucideIcons.BarChart3, category: 'Charts' },
  { name: 'pie-chart', icon: LucideIcons.PieChart, category: 'Charts' },
  { name: 'trending-up', icon: LucideIcons.TrendingUp, category: 'Charts' },
  { name: 'activity', icon: LucideIcons.Activity, category: 'Charts' },

  // Time
  { name: 'timer', icon: LucideIcons.Timer, category: 'Time' },
  { name: 'clock', icon: LucideIcons.Clock, category: 'Time' },
  { name: 'calendar', icon: LucideIcons.Calendar, category: 'Time' },
  { name: 'calendar-days', icon: LucideIcons.CalendarDays, category: 'Time' },

  // Communication
  { name: 'bell', icon: LucideIcons.Bell, category: 'Communication' },
  { name: 'megaphone', icon: LucideIcons.Megaphone, category: 'Communication' },
  { name: 'message-circle', icon: LucideIcons.MessageCircle, category: 'Communication' },
  { name: 'mail', icon: LucideIcons.Mail, category: 'Communication' },
  { name: 'phone', icon: LucideIcons.Phone, category: 'Communication' },

  // Media
  { name: 'image', icon: LucideIcons.Image, category: 'Media' },
  { name: 'film', icon: LucideIcons.Film, category: 'Media' },
  { name: 'video', icon: LucideIcons.Video, category: 'Media' },
  { name: 'mic', icon: LucideIcons.Mic, category: 'Media' },
  { name: 'music-2', icon: LucideIcons.Music2, category: 'Media' },
  { name: 'volume-2', icon: LucideIcons.Volume2, category: 'Media' },

  // Files & Documents
  { name: 'file-text', icon: LucideIcons.FileText, category: 'Files' },
  { name: 'folder-open', icon: LucideIcons.FolderOpen, category: 'Files' },
  { name: 'archive', icon: LucideIcons.Archive, category: 'Files' },
  { name: 'download', icon: LucideIcons.Download, category: 'Files' },
  { name: 'upload', icon: LucideIcons.Upload, category: 'Files' },
  { name: 'file-check', icon: LucideIcons.FileCheck, category: 'Files' },
  { name: 'clipboard-list', icon: LucideIcons.ClipboardList, category: 'Files' },

  // Animals
  { name: 'dog', icon: LucideIcons.Dog, category: 'Animals' },
  { name: 'fish', icon: LucideIcons.Fish, category: 'Animals' },
  { name: 'bug', icon: LucideIcons.Bug, category: 'Animals' },
  { name: 'bird', icon: LucideIcons.Bird, category: 'Animals' },
  { name: 'rabbit', icon: LucideIcons.Rabbit, category: 'Animals' },
  { name: 'squirrel', icon: LucideIcons.Squirrel, category: 'Animals' },
];

// Build lookup using plain object (avoids Map constructor conflict with barrel optimization)
const ICON_MAP: Record<string, LucideIcon> = {};
ICON_LIST.forEach(item => { ICON_MAP[item.name] = item.icon; });

export function getIconByName(name: string): LucideIcon | null {
  return ICON_MAP[name] || null;
}

// Unique categories
const CATEGORIES = [...new Set(ICON_LIST.map(i => i.category))];

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  className?: string;
}

export function IconPicker({
  value,
  onChange,
  label,
  placeholder = 'Select an icon',
  searchPlaceholder = 'Search icons...',
  error,
  className,
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredIcons = useMemo(() => {
    if (!search) return ICON_LIST;
    const q = search.toLowerCase();
    return ICON_LIST.filter(
      item =>
        item.name.includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [search]);

  const SelectedIcon = value ? ICON_MAP[value] : null;

  return (
    <div className={cn('space-y-1.5 w-full relative', className)} ref={containerRef}>
      {label && (
        <label className="text-xs font-bold uppercase tracking-[0.15em] px-1 flex justify-between transition-colors text-zinc-muted/90 dark:text-zinc-muted/80">
          <span>{label}</span>
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center gap-3 bg-white dark:bg-obsidian-card border text-base font-medium text-zinc-text outline-none transition-all shadow-sm rounded-xl h-14 px-4',
          'hover:border-zinc-300 dark:hover:border-white/10',
          isOpen
            ? 'border-brand/40 dark:border-brand/40 ring-2 ring-brand/10'
            : 'border-zinc-200 dark:border-white/5',
          error && 'border-danger'
        )}
      >
        {SelectedIcon ? (
          <>
            <SelectedIcon className="w-5 h-5 text-brand shrink-0" />
            <span className="text-sm font-medium">{value}</span>
          </>
        ) : (
          <span className="text-sm text-zinc-muted/40">{placeholder}</span>
        )}
      </button>

      {error && <p className="text-xs text-danger px-1">{error}</p>}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 right-0 bg-obsidian-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-white/5">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-obsidian-outer border border-white/5 rounded-lg px-3 py-2 text-sm text-zinc-text placeholder:text-zinc-muted/40 outline-none focus:border-brand/30"
              autoFocus
            />
          </div>

          {/* Clear Selection */}
          {value && (
            <div className="px-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                  setSearch('');
                }}
                className="text-[10px] text-zinc-muted hover:text-danger transition-colors font-bold uppercase tracking-widest"
              >
                Clear selection
              </button>
            </div>
          )}

          {/* Icons Grid */}
          <div className="max-h-[280px] overflow-y-auto p-3 space-y-4">
            {CATEGORIES.filter(cat =>
              filteredIcons.some(i => i.category === cat)
            ).map(category => (
              <div key={category}>
                <p className="text-[10px] font-black text-zinc-muted uppercase tracking-widest px-1 mb-2">
                  {category}
                </p>
                <div className="grid grid-cols-8 gap-1">
                  {filteredIcons
                    .filter(i => i.category === category)
                    .map(item => {
                      const IconComp = item.icon;
                      const isSelected = value === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          title={item.name}
                          onClick={() => {
                            onChange(item.name);
                            setIsOpen(false);
                            setSearch('');
                          }}
                          className={cn(
                            'p-2 rounded-lg flex items-center justify-center transition-all',
                            isSelected
                              ? 'bg-brand text-black shadow-md'
                              : 'hover:bg-white/5 text-zinc-muted hover:text-zinc-text'
                          )}
                        >
                          <IconComp className="w-4 h-4" />
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}

            {filteredIcons.length === 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-zinc-muted">No icons found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default IconPicker;
