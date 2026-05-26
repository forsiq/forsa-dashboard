'use client';

import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShoppingBag,
  Package,
  Users,
  Tag,
  BarChart2,
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useLanguage } from '@core/contexts/LanguageContext';
import { useAuth } from '@features/auth/hooks/useAuth';
import { cn } from '@core/lib/utils/cn';

interface NavigationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { icon: ShoppingBag, labelKey: 'mobile.nav.group_buying', path: '/group-buying' },
  { icon: Package, labelKey: 'mobile.nav.inventory', path: '/inventory' },
  { icon: Users, labelKey: 'mobile.nav.customers', path: '/customers' },
  { icon: Tag, labelKey: 'mobile.nav.categories', path: '/categories' },
  { icon: BarChart2, labelKey: 'mobile.nav.reports', path: '/reports' },
  { icon: TrendingUp, labelKey: 'mobile.nav.my_bids', path: '/my-bids' },
  { icon: Settings, labelKey: 'mobile.nav.settings', path: '/settings' },
  { icon: HelpCircle, labelKey: 'mobile.nav.help', path: '/help' },
];

export function NavigationSheet({ isOpen, onClose }: NavigationSheetProps) {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const { logout, user } = useAuth();
  const isRTL = dir === 'rtl';

  React.useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = orig;
    };
  }, [isOpen, onClose]);

  if (typeof window === 'undefined') return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-lg bg-obsidian-card border-t border-white/10 rounded-t-2xl shadow-2xl"
            dir={dir}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <button
              onClick={onClose}
              className={cn(
                'absolute top-3 p-2 rounded-lg text-zinc-muted hover:text-zinc-text hover:bg-white/10 transition-colors',
                isRTL ? 'left-3' : 'right-3',
              )}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="px-6 pb-8 pt-2 space-y-4">
              {/* Profile */}
              <div
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl bg-obsidian-outer',
                  isRTL && 'flex-row-reverse',
                )}
              >
                <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-black text-sm">
                  {(user as any)?.username?.[0] || 'U'}
                </div>
                <div className={cn('flex-1 min-w-0', isRTL ? 'text-right' : 'text-left')}>
                  <p className="text-sm font-bold text-zinc-text truncate">
                    {(user as any)?.username || 'User'}
                  </p>
                  <p className="text-[10px] text-zinc-muted uppercase tracking-widest">
                    {t('mobile.nav.merchant') || 'Merchant'}
                  </p>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              {/* Nav Items */}
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                      'hover:bg-white/5',
                      isRTL && 'flex-row-reverse',
                    )}
                  >
                    <item.icon className="w-5 h-5 text-zinc-muted" />
                    <span
                      className={cn(
                        'flex-1 text-sm font-bold text-zinc-text',
                        isRTL && 'text-right',
                      )}
                    >
                      {t(item.labelKey) || item.labelKey.split('.').pop()}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="h-px bg-white/5" />

              {/* Logout */}
              <button
                onClick={() => {
                  onClose();
                  void logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-danger hover:bg-danger/5 transition-colors"
              >
                <LogOut className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                <span className="flex-1 text-start text-sm font-bold">
                  {t('profile.logout') || 'Logout'}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
