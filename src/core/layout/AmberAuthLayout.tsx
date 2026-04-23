
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
    <div className="min-h-screen w-full flex bg-obsidian-outer overflow-hidden relative selection:bg-brand/30 selection:text-white">
      {/* Cinematic Background Layer Stack */}
      <div 
        className="absolute inset-0 opacity-[0.15] bg-cover bg-center mix-blend-luminosity grayscale pointer-events-none scale-105 animate-slow-zoom" 
        style={{ backgroundImage: `url(${loginBg.src || loginBg})` }}
      />
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Gradients & Glows */}
      <div className="absolute inset-0 bg-gradient-to-br from-obsidian-outer/95 via-obsidian-outer/85 to-obsidian-outer/95 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand/10 blur-[150px] rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full flex flex-col md:flex-row min-h-screen">
        
        {/* Left Side: Branding & Marketing Cinematic (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-[45%] lg:w-[55%] flex-col justify-between p-16 lg:p-24 border-r border-white/5 relative">
           <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />
           
           <div className="flex items-center gap-6">
              <div className="p-3 bg-brand/10 border border-brand/20 rounded-2xl backdrop-blur-2xl shadow-[0_0_50px_rgba(255,192,0,0.2)] ring-1 ring-brand/30 group transition-all duration-500 hover:scale-105">
                 <AmberLogo className="w-10 h-10" />
              </div>
              <div className="flex flex-col">
                 <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                    ZONE<span className="text-brand">VAST</span>
                 </h2>
                 <span className="text-[12px] font-black text-brand/60 uppercase tracking-[0.5em] mt-2 ml-1">
                    ENTERPRISE PROTOCOL
                 </span>
              </div>
           </div>

           <div className="max-w-2xl pt-12">
               <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[1.1] uppercase mb-10 drop-shadow-2xl max-w-lg">
                  {t("auth.marketing.title")}
               </h1>
              
              <div className="w-24 h-2 bg-brand mb-12 rounded-full shadow-[0_0_20px_rgba(255,192,0,0.5)]" />

              <p className="text-lg font-medium text-zinc-muted leading-relaxed max-w-md mb-12 opacity-80">
                 {t('auth.marketing.subtitle')}
              </p>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: t('auth.marketing.feature1.label'), value: t('auth.marketing.feature1.value') },
                  { label: t('auth.marketing.feature2.label'), value: t('auth.marketing.feature2.value') }
                ].map((card, idx) => (
                  <div key={idx} className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 p-8 rounded-3xl hover:bg-white/[0.05] transition-all group cursor-default">
                    <p className="text-[11px] font-black text-zinc-muted uppercase tracking-[0.2em] mb-2 group-hover:text-brand transition-colors">
                       {card.label}
                    </p>
                    <p className="text-xl font-black text-white uppercase tracking-tight leading-tight">
                       {card.value}
                    </p>
                  </div>
                ))}
              </div>
           </div>

           <div className="flex items-center gap-8 text-[11px] font-black text-zinc-muted uppercase tracking-[0.3em] opacity-40">
              <span className="hover:text-white transition-colors cursor-default">© 2026 ZONEVAST</span>
              <div className="w-1.5 h-1.5 rounded-full bg-brand" />
              <span className="hover:text-white transition-colors cursor-default">CORE V4.12.0</span>
           </div>
        </div>

        {/* Right Side: Auth Forms Interaction Layer */}
        <div className="w-full md:w-[55%] lg:w-[45%] flex flex-col relative items-center justify-center p-8 md:p-20">
           {/* Top Navigation / Controls */}
           <div className="absolute top-4 right-4 left-4 md:top-6 md:right-6 md:left-6 flex items-center justify-between z-20">
              <div className="md:hidden flex items-center gap-5">
                 <AmberLogo className="w-10 h-10" />
                 <span className="text-xl font-black text-white tracking-tighter uppercase">ZONE<span className="text-brand">VAST</span></span>
              </div>
              <div className="ml-auto flex items-center gap-4">
                 <AmberSettingsToolbar />
              </div>
           </div>

           {/* Content Card Wrapper */}
            <div className="w-full max-w-[480px] flex flex-col items-center pt-14 md:pt-0">
              <div className="text-center mb-10 animate-fade-in-down">
                 <h1 className="text-4xl font-black text-white tracking-tighter uppercase drop-shadow-lg">
                    {title || t('login.welcome')}
                 </h1>
                 <p className="text-[11px] font-black text-brand uppercase tracking-[0.3em] mt-3 opacity-90">
                    {subtitle || t('login.subtitle')}
                 </p>
              </div>

              <div className="w-full bg-white/[0.02] backdrop-blur-[40px] border border-white/10 p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden animate-fade-up ring-1 ring-white/5">
                 {/* Internal Decorative Elements */}
                 <div className="absolute top-0 right-0 w-48 h-48 bg-brand/10 blur-[80px] -mr-24 -mt-24 pointer-events-none" />
                 <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand/5 blur-[60px] -ml-16 -mb-16 pointer-events-none" />
                 
                 {/* Form Container */}
                 <div className="relative z-10">
                    {children}
                 </div>
              </div>
           </div>

           {/* Security / System Status Footer */}
           <div className="mt-16 md:absolute md:bottom-10 text-center space-y-3">
              <div className="flex items-center justify-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                 <p className="text-[10px] font-black text-zinc-muted uppercase tracking-[0.4em] opacity-40">
                    SECURE ENCRYPTION ACTIVE
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
