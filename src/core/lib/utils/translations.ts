// Import translations from separate language files
import { translations as enTranslations } from '../../translations/en';
import { translations as arTranslations } from '../../translations/ar';
import { translations as kuTranslations } from '../../translations/ku';

export type Language = 'en' | 'ar' | 'ku';

export const languageNames = {
  en: 'English',
  ar: 'العربية',
  ku: 'کوردی'
};

// Common translations shared across all ZoneVast applications
// This file contains ALL shared translations for sidebar, navigation, common UI elements, etc.
// Each app should extend this with app-specific translations only.

export const translations = {
  en: enTranslations,
  ar: arTranslations,
  ku: kuTranslations,
};
