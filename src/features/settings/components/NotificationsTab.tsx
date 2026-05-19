'use client';

import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { useLanguage } from '@yousef2001/core-ui/contexts';
import { AmberCard } from '@core/components/AmberCard';

export function NotificationsTab() {
  const { t } = useLanguage();

  const channels = [
    { key: 'email', label: t('settings.email_notifications') || 'Email Notifications', description: t('settings.email_notifications_desc') || 'Receive order confirmations and updates via email', icon: Mail, enabled: true },
    { key: 'push', label: t('settings.push_notifications') || 'Push Notifications', description: t('settings.push_notifications_desc') || 'Get instant alerts for bids and auction events', icon: Smartphone, enabled: true },
    { key: 'sms', label: t('settings.sms_notifications') || 'SMS Notifications', description: t('settings.sms_notifications_desc') || 'Text alerts for critical auction events', icon: MessageSquare, enabled: false },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-end-4 duration-500">
      <AmberCard className="p-8 bg-[var(--color-obsidian-card)] border border-[var(--color-border)] rounded-2xl shadow-sm">
        <h3 className="text-sm font-black text-zinc-text uppercase tracking-[0.2em] mb-8 pb-4 border-b border-[var(--color-border)]">
          {t('settings.notification_settings') || 'Notification Settings'}
        </h3>

        <div className="space-y-4">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <div
                key={channel.key}
                className="flex items-center justify-between p-5 bg-[var(--color-obsidian-outer)] border border-[var(--color-border)] rounded-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-brand/10 mt-0.5">
                    <Icon className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-zinc-text uppercase tracking-widest">{channel.label}</p>
                    <p className="text-[12px] text-zinc-muted font-medium mt-1">{channel.description}</p>
                  </div>
                </div>
                <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shrink-0 ${
                  channel.enabled
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'bg-white/5 text-zinc-muted border border-white/10'
                }`}>
                  {channel.enabled ? (t('settings.enabled') || 'Enabled') : (t('settings.disabled') || 'Disabled')}
                </span>
              </div>
            );
          })}
        </div>
      </AmberCard>
    </div>
  );
}
