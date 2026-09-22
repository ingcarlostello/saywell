import type { Lang, Localized } from '@/shared/types/i18n.types';
import type { Theme } from '@/store';
import type { LanguageOption, PreferenceTexts } from '../types/preference.types';

// <meta name="theme-color"> per theme (dark = the mockup header). Mirrored in index.html and, once the
// PWA lands, in the manifest of vite.config.ts; scripts/check-arch.mjs fails if they drift apart.
export const THEME_META_COLORS = { dark: '#0c1829', light: '#ffffff' } as const satisfies Record<Theme, string>;

// `dark` matches `@custom-variant dark` in index.css and the boot script of index.html.
export const DOCUMENT_THEME = {
  darkClass: 'dark',
  themeColorSelector: 'meta[name="theme-color"]',
} as const;

// Endonyms: each language is always named in its own language, whatever the UI language is.
export const LANGUAGE_OPTIONS = {
  es: { code: 'ES', name: 'Español' },
  en: { code: 'EN', name: 'English' },
} as const satisfies Record<Lang, LanguageOption>;

export const PREFERENCE_TEXTS = {
  es: {
    themeGroup: 'Tema',
    themeLight: 'Tema claro',
    themeDark: 'Tema oscuro',
    languageTrigger: 'Idioma: {name} ({code})',
  },
  en: {
    themeGroup: 'Theme',
    themeLight: 'Light theme',
    themeDark: 'Dark theme',
    languageTrigger: 'Language: {name} ({code})',
  },
} as const satisfies Localized<PreferenceTexts>;
