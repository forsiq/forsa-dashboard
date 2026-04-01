
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../lib/utils/translations';
import { getLanguage, setLanguage as setLanguageCookie } from '../lib/utils/cookieStorage';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => getLanguage());

  useEffect(() => {
    // Update document direction (RTL for Arabic and Kurdish)
    const dir = (language === 'ar' || language === 'ku') ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
    // Save to cookie for cross-app sync
    setLanguageCookie(language);
  }, [language]);

  const t = (key: string): string => {
    const translation = (translations[language] as Record<string, string>)[key];

    // Detect missing translation
    if (translation === undefined) {
      // Log warning in development
      if (import.meta.env.DEV) {
        console.warn(`[MISSING TRANSLATION] Key: "${key}" for language: "${language}"`);
      }
      // Return marked key in development to show it's missing
      return import.meta.env.DEV ? `[MISSING: ${key}]` : key;
    }

    return translation;
  };

  const dir = (language === 'ar' || language === 'ku') ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
