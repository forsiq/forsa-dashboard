'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Send, Search, Loader2, X, User as UserIcon, History, RotateCcw } from 'lucide-react';
import { useLanguage } from '@yousef2001/core-ui/contexts';
import { cn } from '@core/lib/utils/cn';
import { AmberCard } from '@core/components/AmberCard';
import { AmberButton } from '@core/components/AmberButton';
import { AmberInput } from '@core/components/AmberInput';
import { AmberToggle } from '@core/components/AmberToggle';
import { useGetUsers } from '@features/users/api/user-hooks';
import { useSendBulkNotifications } from '../hooks';
import type { NotificationType } from '../types';
import {
  appendSendNotificationHistory,
  readSendNotificationHistory,
  type SendNotificationHistoryEntry,
  type SendNotificationHistoryTarget,
} from '../lib/sendNotificationHistory';

const MIN_SEARCH_CHARS = 2;

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

function formatHistoryDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-IQ' : 'en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function SendNotificationPage() {
  const { t, dir, language } = useLanguage();
  const sendMutation = useSendBulkNotifications();

  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<NotificationType>('admin_message');
  const [orderId, setOrderId] = useState('');
  const [sendPush, setSendPush] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [history, setHistory] = useState<SendNotificationHistoryEntry[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHistory(readSendNotificationHistory());
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canSearch = debouncedSearch.length >= MIN_SEARCH_CHARS;
  const selectedUserIds = useMemo(
    () => new Set(selectedUsers.map((u) => u.id)),
    [selectedUsers],
  );

  const { data: usersData, isLoading: usersLoading } = useGetUsers(
    {
      search: debouncedSearch,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    { enabled: canSearch },
  );

  const userOptions: UserOption[] = useMemo(() => {
    if (!canSearch) return [];
    const list = usersData?.users ?? [];
    return list
      .map((u) => ({
        id: String(u.id),
        label: u.fullName || u.userName || u.phone || String(u.id),
        sub: [u.phone, u.email].filter(Boolean).join(' • ') || String(u.id),
      }))
      .filter((u) => !selectedUserIds.has(u.id));
  }, [usersData, canSearch, selectedUserIds]);

  const handleSelectUser = (user: UserOption) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.id === user.id) ? prev : [...prev, user],
    );
    setSearch('');
    setShowDropdown(false);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const applyHistoryEntry = useCallback((entry: SendNotificationHistoryEntry) => {
    setTitle(entry.title);
    setBody(entry.body);
    setType(entry.type);
    setOrderId(entry.orderId ?? '');
    setSendPush(entry.sendPush);
    setSelectedUsers(
      entry.targets.map((target) => ({
        id: target.id,
        label: target.label,
        sub: target.sub ?? target.id,
      })),
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;
    if (!title.trim()) return;
    if (!body.trim()) return;

    const payload = {
      title: title.trim(),
      body: body.trim(),
      type,
      orderId: orderId ? Number(orderId) : undefined,
      sendPush,
      data: { source: 'dashboard' },
    };

    try {
      await sendMutation.mutateAsync(
        selectedUsers.map((user) => ({
          ...payload,
          targetUserId: user.id,
        })),
      );

      const targets: SendNotificationHistoryTarget[] = selectedUsers.map((u) => ({
        id: u.id,
        label: u.label,
        sub: u.sub,
      }));

      setHistory(
        appendSendNotificationHistory({
          targets,
          title: payload.title,
          body: payload.body,
          type: payload.type ?? 'admin_message',
          orderId: orderId || undefined,
          sendPush,
        }),
      );

      setTitle('');
      setBody('');
      setOrderId('');
      setSelectedUsers([]);
    } catch {
      // toast handled by mutation
    }
  };

  const canSubmit =
    selectedUsers.length > 0 &&
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    !sendMutation.isPending;

  return (
    <div
      className="space-y-8 p-6 max-w-[700px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700"
      dir={dir}
    >
      <div className="space-y-1">
        <h1 className="text-4xl font-black text-zinc-text tracking-tight leading-none">
          {t('send_notification.title') || 'Send Notification'}
        </h1>
        <p className="text-base text-zinc-secondary font-bold">
          {t('send_notification.subtitle') || 'Send a custom notification to specific users'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AmberCard className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-muted block">
              {t('send_notification.target_users') || 'Target Users'}
            </label>
            {selectedUsers.length > 0 && (
              <span className="text-[11px] font-bold text-brand uppercase tracking-wider">
                {t('send_notification.users_selected', { count: selectedUsers.length })}
              </span>
            )}
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 max-w-full ps-3 pe-2 py-2 rounded-xl border border-brand/20 bg-brand/5"
                >
                  <UserIcon className="w-3.5 h-3.5 text-brand shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-black text-zinc-text truncate max-w-[180px]">
                      {user.label}
                    </p>
                    <p className="text-[10px] text-zinc-muted font-mono truncate max-w-[180px]">
                      {user.sub}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(user.id)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-muted hover:text-danger transition-colors shrink-0"
                    aria-label={t('send_notification.remove_user') || 'Remove user'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div ref={searchContainerRef} className="relative">
            <div className="relative">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-muted pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => {
                  if (search.trim().length >= MIN_SEARCH_CHARS) setShowDropdown(true);
                }}
                placeholder={t('send_notification.search_user') || 'Search...'}
                autoComplete="off"
                className={cn(
                  'w-full bg-white dark:bg-obsidian-card border border-[var(--color-border)]',
                  'text-base font-medium text-zinc-text outline-none transition-all',
                  'placeholder:text-zinc-muted/40 shadow-sm rounded-xl h-14 ps-11 pe-4',
                  'focus:border-brand/40 dark:focus:bg-obsidian-hover',
                )}
              />
              {usersLoading && canSearch && (
                <Loader2 className="absolute end-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand animate-spin" />
              )}
            </div>

            {showDropdown && search.trim().length >= MIN_SEARCH_CHARS && (
              <div className="absolute top-full z-[210] mt-2 w-full bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-xl shadow-xl max-h-60 overflow-y-auto p-1 animate-in fade-in zoom-in-95 duration-100">
                {usersLoading ? (
                  <p className="px-4 py-3 text-sm text-zinc-muted select-none text-center">
                    {t('notifications.loading') || 'Loading...'}
                  </p>
                ) : userOptions.length > 0 ? (
                  userOptions.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="w-full px-3 py-2.5 text-start rounded-lg transition-colors text-zinc-text hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectUser(user);
                      }}
                    >
                      <div className="text-sm font-bold truncate">{user.label}</div>
                      <div className="text-[11px] text-zinc-muted truncate">{user.sub}</div>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-zinc-muted select-none text-center">
                    {t('notifications.empty') || 'No results'}
                  </p>
                )}
              </div>
            )}

            {showDropdown &&
              search.trim().length > 0 &&
              search.trim().length < MIN_SEARCH_CHARS && (
                <div className="absolute top-full z-[210] mt-2 w-full bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-xl shadow-xl p-3 animate-in fade-in zoom-in-95 duration-100">
                  <p className="text-xs text-zinc-muted text-center">
                    {t('send_notification.search_min_chars') ||
                      `Type at least ${MIN_SEARCH_CHARS} characters to search`}
                  </p>
                </div>
              )}
          </div>
        </AmberCard>

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

          <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--color-border)] bg-white/5 px-4 py-3">
            <span className="text-sm font-bold text-zinc-text">
              {t('send_notification.send_push') || 'Also send push notification'}
            </span>
            <AmberToggle
              enabled={sendPush}
              onChange={setSendPush}
              inactiveColor="bg-zinc-muted/30"
              aria-label={t('send_notification.send_push') || 'Also send push notification'}
            />
          </div>
        </AmberCard>

        <div className="flex justify-end">
          <AmberButton type="submit" disabled={!canSubmit} className="gap-2 px-6">
            {sendMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('send_notification.sending') || 'Sending...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {selectedUsers.length > 1
                  ? t('send_notification.send_to_count', { count: selectedUsers.length })
                  : t('send_notification.send') || 'Send Notification'}
              </>
            )}
          </AmberButton>
        </div>
      </form>

      <AmberCard className="p-6 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-text">
            {t('send_notification.history_title') || 'Recent sends'}
          </h2>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-zinc-muted text-center py-4">
            {t('send_notification.no_history') || 'No sent notifications yet'}
          </p>
        ) : (
          <ul className="space-y-2">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-white/5"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-bold text-zinc-text truncate">{entry.title}</p>
                  <p className="text-xs text-zinc-muted line-clamp-2">{entry.body}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-zinc-muted">
                    <span>{formatHistoryDate(entry.sentAt, language)}</span>
                    <span>·</span>
                    <span>
                      {t('send_notification.history_recipients', {
                        count: entry.targets.length,
                      })}
                    </span>
                    {entry.orderId ? (
                      <>
                        <span>·</span>
                        <span>
                          {t('send_notification.order_id')}: {entry.orderId}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <p className="text-[10px] text-zinc-muted truncate">
                    {entry.targets.map((u) => u.label).join(' · ')}
                  </p>
                </div>
                <AmberButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 gap-1.5 text-xs"
                  onClick={() => applyHistoryEntry(entry)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t('send_notification.use_again') || 'Use again'}
                </AmberButton>
              </li>
            ))}
          </ul>
        )}
      </AmberCard>
    </div>
  );
}
