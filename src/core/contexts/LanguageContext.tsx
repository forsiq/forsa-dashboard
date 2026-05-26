import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import Cookies from 'js-cookie';
import {
  translations,
  mergeTranslations,
  type Language,
} from '@yousef2001/core-ui';

const LANGUAGE_COOKIE = 'zv_language';

function getLanguage(): Language {
  const saved = Cookies.get(LANGUAGE_COOKIE);
  if (saved === 'en' || saved === 'ar' || saved === 'ku') return saved;
  return 'en';
}

function setLanguageCookie(language: Language): void {
  Cookies.set(LANGUAGE_COOKIE, language, { path: '/', sameSite: 'lax' });
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  lookup: (key: string) => string | undefined;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
}

export interface LanguageProviderProps {
  children: ReactNode;
  extraTranslations?: Record<Language, Record<string, string>>;
  /** SSR: language from request cookie so server HTML matches hydration. */
  initialLanguage?: Language;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function normalizeLanguage(value: string | undefined): Language {
  if (value === 'ar' || value === 'ku' || value === 'en') return value;
  return 'en';
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  extraTranslations,
  initialLanguage,
}) => {
  const [language, setLanguageState] = useState<Language>(() =>
    normalizeLanguage(initialLanguage),
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = getLanguage();
    const serverLang = normalizeLanguage(initialLanguage);
    if (saved && saved !== serverLang) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, [initialLanguage]);

  useEffect(() => {
    if (!mounted) return;
    const dir = language === 'ar' || language === 'ku' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
    setLanguageCookie(language);
  }, [language, mounted]);

  const mergedTranslations = useMemo(
    () => ({
      en: mergeTranslations(
        translations.en as unknown as Record<string, string>,
        extraTranslations?.en,
      ),
      ar: mergeTranslations(
        translations.ar as unknown as Record<string, string>,
        extraTranslations?.ar,
      ),
      ku: mergeTranslations(
        translations.ku as unknown as Record<string, string>,
        extraTranslations?.ku,
      ),
    }),
    [extraTranslations],
  );

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const bundle = mergedTranslations[language] as Record<string, string>;
    const enBundle = mergedTranslations.en as Record<string, string>;
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
      translation =
        process.env.NODE_ENV === 'development' ? `[MISSING: ${key}]` : key;
      return translation;
    }

    if (variables) {
      Object.entries(variables).forEach(([vKey, vValue]) => {
        translation = translation.replace(
          new RegExp(`{{${vKey}}}`, 'g'),
          String(vValue),
        );
        translation = translation.replace(
          new RegExp(`{${vKey}}`, 'g'),
          String(vValue),
        );
      });
    }

    return translation;
  };

  const lookup = (key: string): string | undefined => {
    const bundle = mergedTranslations[language] as Record<string, string>;
    const enBundle = mergedTranslations.en as Record<string, string>;
    return bundle[key] ?? enBundle[key];
  };

  const dir = language === 'ar' || language === 'ku' ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, lookup, dir, isRTL }}
    >
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

export type { Language };
