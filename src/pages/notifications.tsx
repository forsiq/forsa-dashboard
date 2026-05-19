'use client';

import { useState } from 'react';
import { Bell, Check, CheckCheck, Info, AlertTriangle, Trophy, ShoppingCart } from 'lucide-react';
import { useLanguage } from '@yousef2001/core-ui/contexts';
import { cn } from '@core/lib/utils/cn';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
  icon: React.ElementType;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'New Bid Placed',
    message: 'Someone placed a bid of 15,000 IQD on "Antique Persian Rug"',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
    type: 'info',
    icon: Trophy,
  },
  {
    id: '2',
    title: 'Auction Ending Soon',
    message: 'Your watched auction "Vintage Clock Collection" ends in 30 minutes',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
    type: 'warning',
    icon: AlertTriangle,
  },
  {
    id: '3',
    title: 'Order Confirmed',
    message: 'Your order #ORD-2024-001 has been confirmed and is being processed',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: true,
    type: 'success',
    icon: ShoppingCart,
  },
  {
    id: '4',
    title: 'Auction Won!',
    message: 'Congratulations! You won the auction for "Handmade Ceramics Set"',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true,
    type: 'success',
    icon: Trophy,
  },
  {
    id: '5',
    title: 'System Update',
    message: 'New features have been added to the auction platform. Check them out!',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    type: 'info',
    icon: Info,
  },
];

export default function NotificationsPage() {
  const { t, dir } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t('notifications.just_now') || 'Just now';
    if (minutes < 60) return `${minutes}m ${t('notifications.ago') || 'ago'}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${t('notifications.ago') || 'ago'}`;
    const days = Math.floor(hours / 24);
    return `${days}d ${t('notifications.ago') || 'ago'}`;
  };

  const typeColors = {
    info: 'bg-info/10 text-info border-info/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
  };

  return (
    <div className="space-y-8 p-6 max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700" dir={dir}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
            {t('notifications.title') || 'Notifications'}
          </h1>
          <p className="text-base text-zinc-secondary font-bold">
            {unreadCount > 0
              ? `${unreadCount} ${t('notifications.unread') || 'unread'}`
              : (t('notifications.all_read') || 'All caught up!')}
          </p>
        </div>
        {unreadCount > 0 && (
          <AmberButton
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="gap-2 border-[var(--color-border)] font-bold"
          >
            <CheckCheck className="w-4 h-4" />
            {t('notifications.mark_all_read') || 'Mark all as read'}
          </AmberButton>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <AmberCard className="p-12 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm text-center">
            <Bell className="w-12 h-12 text-zinc-muted mx-auto mb-4" />
            <p className="text-sm font-bold text-zinc-muted uppercase tracking-widest">
              {t('notifications.empty') || 'No notifications yet'}
            </p>
          </AmberCard>
        ) : (
          notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <AmberCard
                key={notification.id}
                className={cn(
                  'p-5 border rounded-2xl shadow-sm transition-all cursor-pointer hover:border-white/10',
                  notification.read
                    ? 'bg-[var(--color-obsidian-card)] border-[var(--color-border)]'
                    : 'bg-[var(--color-obsidian-card)] border-brand/20 shadow-brand/5',
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('p-2.5 rounded-xl border shrink-0', typeColors[notification.type])}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className={cn(
                        'text-sm font-black tracking-tight',
                        notification.read ? 'text-zinc-muted' : 'text-zinc-text',
                      )}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-brand" />
                        )}
                        <span className="text-[11px] text-zinc-muted font-medium">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className={cn(
                      'text-[13px] font-medium mt-1 leading-relaxed',
                      notification.read ? 'text-zinc-muted/70' : 'text-zinc-muted',
                    )}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              </AmberCard>
            );
          })
        )}
      </div>
    </div>
  );
}
