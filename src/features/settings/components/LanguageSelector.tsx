import React from 'react';
import { Globe } from 'lucide-react';
import { AmberCard } from '@core/components/AmberCard';
import { useLanguage } from '@core/contexts/LanguageContext';

const languages = [
  { code: 'en' as const, name: 'English', flag: '🇺🇸' },
  { code: 'ar' as const, name: 'العربية', flag: '🇸🇦' },
  { code: 'ku' as const, name: 'کوردی', flag: '🇹🇯' }
];

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, dir, t } = useLanguage();

  return (
    <AmberCard>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/5 rounded-lg">
          <Globe className="w-5 h-5 text-zinc-text" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-text">
            {t('settings.lang_selector_title')}
          </p>
          <p className="text-[10px] text-zinc-muted uppercase tracking-wider">
            {t('settings.lang_selector_desc')}
          </p>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-2 ${dir === 'rtl' ? 'rtl' : ''}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`
              flex items-center gap-3 p-3 rounded-lg border transition-all
              ${language === lang.code
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-white/10 bg-obsidian-outer text-zinc-text hover:border-white/20'
              }
            `}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="text-sm font-bold">{lang.name}</span>
            {language === lang.code && (
              <span className="ms-auto text-[10px] uppercase tracking-wider">{t('settings.lang_active')}</span>
            )}
          </button>
        ))}
      </div>
    </AmberCard>
  );
};
