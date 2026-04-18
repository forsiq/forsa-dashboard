
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
    <div className="min-h-screen w-full flex bg-obsidian-outer overflow-hidden relative">
      {/* Global Background Layer */}
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-luminosity grayscale pointer-events-none" 
        style={{ backgroundImage: `url(${loginBg.src || loginBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-obsidian-outer/90 via-obsidian-outer/80 to-obsidian-outer/90 pointer-events-none" />
      
      {/* Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full flex flex-col md:flex-row min-h-screen">
        
        {/* Left Side: Branding & Features (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-[50%] lg:w-[60%] flex-col justify-between p-12 lg:p-20 border-r border-white/5">
           <div className="flex items-center gap-5">
              <div className="p-4 bg-brand/10 border border-brand/20 rounded-2xl backdrop-blur-md shadow-[0_0_30px_rgba(255,192,0,0.15)] ring-1 ring-brand/20">
                 <AmberLogo className="w-12 h-12" />
              </div>
              <div className="flex flex-col">
                 <span className="text-3xl font-black text-zinc-text tracking-tight uppercase leading-none">ZONE<span className="text-brand">VAST</span></span>
                 <span className="text-[11px] font-extrabold text-zinc-muted uppercase tracking-[0.4em] mt-1 opacity-80">Next-Gen Auction Systems</span>
              </div>
           </div>

           <div className="max-w-xl animate-fade-in translate-y-[-20%]">
              <h2 className="text-5xl lg:text-7xl font-black text-zinc-text tracking-tighter leading-[0.9] uppercase italic mb-8" 
                  dangerouslySetInnerHTML={{ __html: t('auth.marketing.title').replace(' ', '<br />') }} />
              <p className="text-lg font-medium text-zinc-muted leading-relaxed max-w-md mb-12">
                 {t('auth.marketing.subtitle')}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: t('auth.marketing.feature1.label'), value: t('auth.marketing.feature1.value') },
                  { label: t('auth.marketing.feature2.label'), value: t('auth.marketing.feature2.value') }
                ].map((card, idx) => (
                  <div key={idx} className="bg-white/[0.05] dark:bg-white/[0.03] backdrop-blur-xl border border-zinc-200 dark:border-white/5 p-6 rounded-2xl hover:bg-white/[0.05] transition-all group">
                    <p className="text-[10px] font-bold text-zinc-muted dark:text-zinc-muted uppercase tracking-widest mb-1 group-hover:text-brand transition-colors">{card.label}</p>
                    <p className="text-xl font-bold text-zinc-text dark:text-zinc-text uppercase tracking-tight">{card.value}</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-muted uppercase tracking-widest opacity-60">
              <span>© 2026 ZONEVAST</span>
              <div className="w-1 h-1 rounded-full bg-zinc-muted" />
              <span>TERMINAL V4.12.0</span>
           </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="w-full md:w-[50%] lg:w-[40%] flex flex-col relative items-center justify-center p-6 md:p-12">
           {/* Top Bar for Mobile/Tablet */}
           <div className="absolute top-8 inset-x-8 flex items-center justify-between">
              <div className="md:hidden flex items-center gap-4">
                 <AmberLogo className="w-10 h-10" />
                 <span className="text-2xl font-black text-zinc-text tracking-tight uppercase">ZONE<span className="text-brand">VAST</span></span>
              </div>
              <div className="ml-auto">
                 <AmberSettingsToolbar />
              </div>
           </div>

           {/* Central Auth Card */}
           <div className="w-full max-w-[440px] flex flex-col items-center">
              <div className="text-center mb-10">
                 <h1 className="text-4xl font-black text-zinc-text tracking-tighter uppercase italic">{title || t('login.welcome')}</h1>
                 <p className="text-xs font-bold text-zinc-muted uppercase tracking-[0.2em] mt-3">{subtitle || t('login.subtitle')}</p>
                 <div className="h-1 w-12 bg-brand mx-auto mt-6 rounded-full" />
              </div>

              <div className="w-full bg-white/[0.05] dark:bg-white/[0.02] backdrop-blur-3xl border border-zinc-200 dark:border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden animate-fade-up">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 dark:bg-brand/10 blur-3xl -mr-16 -mt-16 pointer-events-none" />
                 {children}
              </div>
           </div>

           {/* Mobile Footer */}
           <div className="mt-12 md:absolute md:bottom-8 text-center opacity-30">
              <p className="text-[9px] font-bold text-zinc-muted uppercase tracking-[0.3em]">SECURE ACCESS POINT 01</p>
           </div>
        </div>

      </div>
    </div>
  );
};
