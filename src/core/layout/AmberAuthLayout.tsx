
import React from 'react';
import { AmberLogo } from '../components/AmberLogo';
import { AmberSettingsToolbar } from '../components/AmberSettingsToolbar';
import loginBg from '../assets/login-bg.png';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AmberAuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen w-full flex flex-col bg-obsidian-outer overflow-x-hidden relative selection:bg-brand/30 selection:text-white">
      <div
        className="absolute inset-0 opacity-[0.1] bg-cover bg-center mix-blend-luminosity grayscale pointer-events-none"
        style={{ backgroundImage: `url(${loginBg.src || loginBg})` }}
      />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      <div className="absolute inset-0 bg-gradient-to-br from-obsidian-outer/95 via-obsidian-outer/90 to-obsidian-outer/95 pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/5 px-4 py-4 md:px-8 md:py-5">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <div className="shrink-0 p-2.5 bg-brand/10 border border-brand/20 rounded-xl backdrop-blur-md ring-1 ring-brand/20">
              <AmberLogo className="w-8 h-8 md:w-9 md:h-9" />
            </div>
            <div className="min-w-0 text-start">
              <h2 className="text-base md:text-lg font-black text-zinc-text tracking-tight uppercase leading-none truncate">
                {t('auth.brand.line1')}
                <span className="text-brand">{t('auth.brand.line2')}</span>
              </h2>
              <p className="text-[10px] md:text-[11px] font-bold text-zinc-secondary uppercase tracking-widest mt-1.5">
                {t('auth.brand.tagline')}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <AmberSettingsToolbar />
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:py-12 w-full max-w-[1600px] mx-auto">
          <div className="w-full max-w-[480px] flex flex-col">
            <div className="text-center mb-8 md:mb-10">
              <h1 className="text-3xl md:text-4xl font-black text-zinc-text tracking-tight uppercase leading-none">
                {title || t('login.welcome')}
              </h1>
              <p className="text-sm text-zinc-secondary font-bold uppercase tracking-tight mt-2 md:mt-3">
                {subtitle || t('login.subtitle')}
              </p>
            </div>

            <div className="w-full bg-white/[0.02] backdrop-blur-[32px] border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden ring-1 ring-white/5">
              <div className="absolute top-0 end-0 w-40 h-40 bg-brand/8 blur-[64px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 start-0 w-32 h-32 bg-brand/5 blur-[48px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              <div className="relative z-10">{children}</div>
            </div>
          </div>
        </main>

        <footer className="shrink-0 py-5 md:py-6 text-center border-t border-white/5">
          <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-widest opacity-60 max-w-md mx-auto px-4">
            {t('auth.footer.hint')}
          </p>
        </footer>
      </div>
    </div>
  );
};
