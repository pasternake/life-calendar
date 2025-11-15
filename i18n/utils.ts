
import type { Language } from '../types';
import { translations } from './translations';

export const t = (
  lang: Language,
  key: keyof typeof translations.en,
  replacements?: Record<string, string | number>
): string => {
  let translation = translations[lang][key] || translations.en[key];

  if (replacements) {
    Object.entries(replacements).forEach(([key, value]) => {
      translation = translation.replace(`{${key}}`, String(value));
    });
  }

  return translation;
};
