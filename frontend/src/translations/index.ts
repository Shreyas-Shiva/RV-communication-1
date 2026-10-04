import { LanguageCode, Translations } from './types';
import { en } from './en';
import { kn } from './kn';
import { hi } from './hi';
import { ta } from './ta';
import { te } from './te';
import { ml } from './ml';

export * from './types';

export const translations: Record<LanguageCode, Translations> = {
  en,
  kn,
  hi,
  ta,
  te,
  ml
};

export function getTranslations(lang: LanguageCode): Translations {
  return translations[lang] || translations.en;
}
