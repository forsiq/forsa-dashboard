// Locale exports - merged translations for each language
import { en } from './en';
import { ar } from './ar';
import { ku } from './ku';

export const translations = {
  en,
  ar,
  ku,
} as const;

export type Language = keyof typeof translations;
