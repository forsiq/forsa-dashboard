'use client';

import React, { useState, useMemo } from 'react';
import { Send, Search, Loader2, X, User as UserIcon, MessageSquare } from 'lucide-react';
import { useLanguage } from '@yousef2001/core-ui/contexts';
import { cn } from '@core/lib/utils/cn';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { useGetUsers } from '@features/users/api/user-hooks';
import { useSendNotification } from '../hooks';
import type { NotificationType } from '../types';

interface UserOption {
  id: string;
  label: string;
  sub: string;
}

const NOTIF_TYPES: NotificationType[] = [
  'admin_message',
  'order_update',
  'auction_update',
  'deal_update',
  'system',
];

export function SendNotificationPage() {
  const { t, dir } = useLanguage();
  const sendMutation = useSendNotification();

  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserLabel, setSelectedUserLabel] = useState<string>('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<NotificationType>('admin_message');
  const [orderId, setOrderId] = useState('');
  const [sendPush, setSendPush] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch users when searching
  const { data: usersData, isLoading: usersLoading } = useGetUsers({
    search: search || undefined,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const userOptions: UserOption[] = useMemo(() => {
    const list = usersData?.users ?? [];
    return list.map((u) => ({
      id: String(u.id),
      label: u.fullName || u.userName || u.phone || String(u.id),
      sub: [u.phone, u.email].filter(Boolean).join(' • ') || String(u.id),
    }));
  }, [usersData]);

  const handleSelectUser = (user: UserOption) => {
    setSelectedUserId(user.id);
    setSelectedUserLabel(user.label);
    setSearch('');
    setShowDropdown(false);
  };

  const handleClearUser = () => {
    setSelectedUserId(null);
    setSelectedUserLabel('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    if (!title.trim()) return;
    if (!body.trim()) return;

    sendMutation.mutate({
      targetUserId: selectedUserId,
      title: title.trim(),
      body: body.trim(),
      type,
      orderId: orderId ? Number(orderId) : undefined,
      sendPush,
      data: {
        source: 'dashboard',
      },
    });

    // Reset on success (only after mutation resolves — optimistic reset)
    if (!sendMutation.isError) {
      setTitle('');
      setBody('');
      setOrderId('');
    }
  };

  const canSubmit =
    !!selectedUserId && title.trim().length > 0 && body.trim().length > 0 && !sendMutation.isPending;

  return (
    <div className="space-y-8 p-6 max-w-[700px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700" dir={dir}>
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
          {t('send_notification.title') || 'Send Notification'}
        </h1>
        <p className="text-base text-zinc-secondary font-bold">
          {t('send_notification.subtitle') || 'Send a custom notification to a specific user'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Search */}
        <AmberCard className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm space-y-4">
          <label className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-muted block">
            {t('send_notification.target_user') || 'Target User'}
          </label>

          {selectedUserId ? (
            <div className="flex items-center justify-between gap-3 p-4 rounded-xl border border-brand/20 bg-brand/5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-brand/10 shrink-0">
                  <UserIcon className="w-4 h-4 text-brand" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-zinc-text truncate">
                    {selectedUserLabel}
                  </p>
                  <p className="text-[11px] text-zinc-muted font-mono truncate">
                    {selectedUserId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearUser}
                className="p-2 rounded-lg hover:bg-white/5 text-zinc-muted hover:text-danger transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder={t('send_notification.search_user') || 'Search...'}
                  className="w-full bg-white dark:bg-obsidian-card border border-[var(--color-border)] text-base font-medium text-zinc-text outline-none transition-all placeholder:text-zinc-muted/40 shadow-sm rounded-xl h-14 pl-11 pr-4 focus:border-brand/40"
                />
                {usersLoading && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted animate-spin" />
                )}
              </div>

              {showDropdown && (search.length > 0 || userOptions.length > 0) && (
                <ul className="absolute z-50 mt-1 w-full bg-[var(--color-obsidian-card)] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                  {userOptions.length > 0 ? (
                    userOptions.map((user) => (
                      <li
                        key={user.id}
                        className="px-4 py-3 cursor-pointer text-sm transition-colors text-zinc-text hover:bg-white/5 first:rounded-t-xl last:rounded-b-xl"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectUser(user);
                        }}
                      >
                        <div className="font-bold">{user.label}</div>
                        <div className="text-[11px] text-zinc-muted">{user.sub}</div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-zinc-muted select-none">
                      {search.length === 0
                        ? (t('send_notification.search_user') || 'Type to search...')
                        : (t('notifications.empty') || 'No results')}
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </AmberCard>

        {/* Notification Content */}
        <AmberCard className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm space-y-5">
          <AmberInput
            label={t('send_notification.title_field') || 'Title'}
            value={title}
            onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
            placeholder={t('send_notification.title_placeholder') || 'Notification title'}
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-muted block px-1">
              {t('send_notification.body_field') || 'Message'}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('send_notification.body_placeholder') || 'Notification message...'}
              rows={4}
              required
              className="w-full bg-white dark:bg-obsidian-card border border-[var(--color-border)] text-base font-medium text-zinc-text outline-none transition-all placeholder:text-zinc-muted/40 shadow-sm rounded-xl p-4 resize-none focus:border-brand/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-muted block px-1">
              {t('send_notification.type_field') || 'Type'}
            </label>
            <div className="flex flex-wrap gap-2">
              {NOTIF_TYPES.map((nt) => (
                <button
                  key={nt}
                  type="button"
                  onClick={() => setType(nt)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border',
                    type === nt
                      ? 'bg-brand/15 text-brand border-brand/30'
                      : 'bg-transparent text-zinc-muted border-[var(--color-border)] hover:border-white/10',
                  )}
                >
                  {t(`notifications.type.${nt}`) || nt}
                </button>
              ))}
            </div>
          </div>

          <AmberInput
            label={`${t('send_notification.order_link') || 'Link to Order (optional)'}`}
            value={orderId}
            onChange={(e) => setOrderId((e.target as HTMLInputElement).value)}
            placeholder={t('send_notification.order_id') || 'Order ID'}
            type="number"
          />

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={sendPush}
              onClick={() => setSendPush((v) => !v)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                sendPush ? 'bg-brand' : 'bg-zinc-muted/30',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  sendPush ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
            <span className="text-sm font-bold text-zinc-text">
              {t('send_notification.send_push') || 'Also send push notification'}
            </span>
          </label>
        </AmberCard>

        {/* Submit */}
        <div className="flex justify-end">
          <AmberButton
            type="submit"
            disabled={!canSubmit}
            className="gap-2 px-6"
          >
            {sendMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('send_notification.sending') || 'Sending...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t('send_notification.send') || 'Send Notification'}
              </>
            )}
          </AmberButton>
        </div>
      </form>
    </div>
  );
}
