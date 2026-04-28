import React from 'react';
import { AmberLogo } from '@core/components/AmberLogo';
import { AmberSettingsToolbar } from '@core/components/AmberSettingsToolbar';
import { useLanguage } from '@core/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface ForsaAuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const ForsaAuthLayout: React.FC<ForsaAuthLayoutProps> = ({ children, title, subtitle }) => {
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen w-full flex flex-col bg-obsidian-outer selection:bg-brand/30 selection:text-white" dir={dir}>
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-obsidian-card border border-border shadow-sm">
            <AmberLogo className="w-8 h-8" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-zinc-text tracking-tighter uppercase leading-none">
              ZONE<span className="text-brand">VAST</span>
            </span>
            <span className="text-[9px] font-black text-zinc-muted uppercase tracking-[0.4em] mt-0.5">
              FORSA
            </span>
          </div>
        </div>
        <AmberSettingsToolbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-[460px]">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-black text-zinc-text tracking-tight uppercase">
              {title || t('login.welcome')}
            </h1>
            <p className="text-xs font-bold text-brand uppercase tracking-[0.2em] mt-2">
              {subtitle || t('login.subtitle')}
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="bg-obsidian-card border border-border rounded-3xl shadow-sm p-8 md:p-10"
          >
            {children}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              <p className="text-[10px] font-bold text-zinc-muted uppercase tracking-[0.3em]">
                Secure Connection
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
