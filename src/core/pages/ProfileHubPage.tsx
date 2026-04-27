import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowRight, LogOut, User } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { PageHeader } from '@core/components/Layout/PageHeader';
import { useLanguage } from '@core/contexts/LanguageContext';
import { clearAuthCookies, cn, getUser } from '@core/lib';
import { stopProactiveTokenRefresh } from '@core/services/ApiClientFactory';

export const ProfileHubPage: React.FC = () => {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [user, setUserState] = useState<ReturnType<typeof getUser>>(null);

  useEffect(() => {
    setUserState(getUser());
  }, []);

  const handleLogout = () => {
    stopProactiveTokenRefresh();
    if (typeof window !== 'undefined') {
      clearAuthCookies();
      localStorage.removeItem('user');
      localStorage.removeItem('zv_project');
    }
    router.replace('/login');
  };

  const row = (label: string, value: string | undefined) => (
    <div className="space-y-1 border-b border-white/5 py-3 last:border-0">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-muted">{label}</p>
      <p className="text-sm font-semibold text-zinc-text break-all" dir="ltr">
        {value && value.length > 0 ? value : '—'}
      </p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <PageHeader title={t('profile_portal.page_title')} description={t('profile_portal.intro')} />

      <AmberCard glass className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-muted">
          <User className="h-4 w-4 text-brand" />
          {t('profile_portal.card_title')}
        </div>

        {!user ? (
          <p className="text-sm text-zinc-muted">{t('profile_portal.empty')}</p>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/[0.02] px-4">
            {row(t('profile_portal.user_id'), user.id)}
            {row(t('profile_portal.username'), user.username)}
            {row(t('profile_portal.email'), user.email)}
          </div>
        )}

        <div
          className={cn(
            'flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between',
            dir === 'rtl' && 'sm:flex-row-reverse'
          )}
        >
          <Link
            href="/settings"
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-zinc-text transition-colors hover:border-brand/30 hover:bg-brand/5',
              dir === 'rtl' && 'flex-row-reverse'
            )}
          >
            {t('profile_portal.link_settings')}
            <ArrowRight
              className={cn('h-4 w-4 shrink-0 text-brand', dir === 'rtl' && 'rotate-180')}
            />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-lg border border-danger/20 bg-danger/5 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-danger/90 transition-colors hover:bg-danger/10',
              dir === 'rtl' && 'flex-row-reverse'
            )}
          >
            <LogOut className="h-4 w-4" />
            {t('profile_portal.logout')}
          </button>
        </div>
      </AmberCard>
    </div>
  );
};
