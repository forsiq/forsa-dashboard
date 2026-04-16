
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../lib/utils/translations';
import { getLanguage, setLanguage as setLanguageCookie } from '../lib/utils/cookieStorage';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = getLanguage();
    if (savedLanguage !== language) {
      setLanguageState(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Update document direction (RTL for Arabic and Kurdish)
    const dir = (language === 'ar' || language === 'ku') ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
    // Save to cookie for cross-app sync
    setLanguageCookie(language);
  }, [language]);

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const bundle = translations[language] as unknown as Record<string, string>;
    const enBundle = translations.en as unknown as Record<string, string>;
    let translation = bundle[key];

    if (translation === undefined && language !== 'en') {
      translation = enBundle[key];
      if (translation !== undefined && process.env.NODE_ENV === 'development') {
        console.warn(`[i18n fallback→en] Key: "${key}" missing for "${language}"`);
      }
    }

    if (translation === undefined) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[MISSING TRANSLATION] Key: "${key}" for language: "${language}"`);
      }
      translation = process.env.NODE_ENV === 'development' ? `[MISSING: ${key}]` : key;
      return translation;
    }

    // Handle interpolation if variables are provided
    if (variables) {
      Object.entries(variables).forEach(([vKey, vValue]) => {
        translation = translation.replace(new RegExp(`{{${vKey}}}`, 'g'), String(vValue));
        // Also support {key} format
        translation = translation.replace(new RegExp(`{${vKey}}`, 'g'), String(vValue));
      });
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
