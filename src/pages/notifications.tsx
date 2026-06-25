'use client';

import { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Info,
  AlertTriangle,
  Trophy,
  ShoppingCart,
  MessageSquare,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@yousef2001/core-ui/contexts';
import { cn } from '@core/lib/utils/cn';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import {
  useListNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  notificationKeys,
} from '@services/notifications';
import { useQueryClient } from '@tanstack/react-query';
import type { AppNotification, NotificationType } from '@services/notifications';

const TYPE_ICON: Partial<Record<NotificationType, React.ElementType>> = {
  order_update: ShoppingCart,
  auction_update: Trophy,
  deal_update: ShoppingCart,
  admin_message: MessageSquare,
  system: Info,
};

function iconFor(notification: AppNotification): React.ElementType {
  const fromData =
    notification.data?.type === 'ORDER_UPDATE'
      ? ShoppingCart
      : notification.data?.type === 'AUCTION_UPDATE'
        ? Trophy
        : null;
  if (fromData) return fromData;
  return TYPE_ICON[notification.type] ?? Bell;
}

function category(notification: AppNotification): 'info' | 'success' | 'warning' {
  if (notification.type === 'admin_message') return 'info';
  const sub = String(notification.data?.orderEventType ?? notification.data?.auctionEventType ?? '');
  if (['cancelled', 'outbid'].includes(sub)) return 'warning';
  if (['won', 'delivered', 'paid', 'confirmed'].includes(sub)) return 'success';
  return 'info';
}

export default function NotificationsPage() {
  const { t, dir } = useLanguage();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching, refetch } = useListNotifications({ page, limit });
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const pagination = data?.pagination;

  const handleMarkRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      },
    });
  };

  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return '';
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
        <div className="flex items-center gap-2">
          <AmberButton
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2 border-[var(--color-border)] font-bold"
            disabled={isFetching}
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            {t('notifications.refresh') || 'Refresh'}
          </AmberButton>
          {unreadCount > 0 && (
            <AmberButton
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="gap-2 border-[var(--color-border)] font-bold"
              disabled={markAllAsRead.isPending}
            >
              <CheckCheck className="w-4 h-4" />
              {t('notifications.mark_all_read') || 'Mark all as read'}
            </AmberButton>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <AmberCard className="p-12 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm text-center">
            <Loader2 className="w-8 h-8 text-zinc-muted mx-auto mb-4 animate-spin" />
            <p className="text-sm font-bold text-zinc-muted uppercase tracking-widest">
              {t('notifications.loading') || 'Loading...'}
            </p>
          </AmberCard>
        ) : notifications.length === 0 ? (
          <AmberCard className="p-12 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm text-center">
            <Bell className="w-12 h-12 text-zinc-muted mx-auto mb-4" />
            <p className="text-sm font-bold text-zinc-muted uppercase tracking-widest">
              {t('notifications.empty') || 'No notifications yet'}
            </p>
          </AmberCard>
        ) : (
          notifications.map((notification) => {
            const Icon = iconFor(notification);
            const cat = category(notification);
            return (
              <AmberCard
                key={notification.id}
                className={cn(
                  'p-5 border rounded-2xl shadow-sm transition-all cursor-pointer hover:border-white/10',
                  notification.isRead
                    ? 'bg-[var(--color-obsidian-card)] border-[var(--color-border)]'
                    : 'bg-[var(--color-obsidian-card)] border-brand/20 shadow-brand/5',
                )}
                onClick={() => !notification.isRead && handleMarkRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('p-2.5 rounded-xl border shrink-0', typeColors[cat])}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className={cn(
                        'text-sm font-black tracking-tight',
                        notification.isRead ? 'text-zinc-muted' : 'text-zinc-text',
                      )}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-brand" />
                        )}
                        <span className="text-[11px] text-zinc-muted font-medium">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className={cn(
                      'text-[13px] font-medium mt-1 leading-relaxed',
                      notification.isRead ? 'text-zinc-muted/70' : 'text-zinc-muted',
                    )}>
                      {notification.body}
                    </p>
                    {notification.type !== 'system' && (
                      <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-muted/60">
                        {t(`notifications.type.${notification.type}`) || notification.type}
                      </span>
                    )}
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(notification.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-zinc-muted hover:text-zinc-text shrink-0"
                      title={t('notifications.mark_read') || 'Mark as read'}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </AmberCard>
            );
          })
        )}
      </div>

      {pagination && pagination.hasNext && (
        <div className="flex justify-center">
          <AmberButton
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={isFetching}
            className="gap-2"
          >
            {isFetching && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('notifications.load_more') || 'Load more'}
          </AmberButton>
        </div>
      )}
    </div>
  );
}
