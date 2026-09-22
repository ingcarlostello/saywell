import type { Lang } from '@/shared/types/i18n.types';
import { interpolate } from '@/shared/utils/i18n.utils';
import type { Theme } from '@/store';
import { DEFAULT_THEME, THEME, THEMES } from '@/store/store.constants';
import { LANGUAGE_OPTIONS } from '../constants/preference.constants';
import type { PreferenceTexts } from '../types/preference.types';

// Persisted values come from JSON.parse unvalidated (§12.6 #4); anything but 'light' is dark, as in the
// boot script of index.html, so the DOM and the controls never disagree.
export function toSupportedTheme(value: unknown): Theme {
  return THEMES.find((theme) => theme === value) ?? DEFAULT_THEME;
}

export function isDarkTheme(theme: Theme): boolean {
  return theme === THEME.dark;
}

// Accessible name of the language trigger; keeps the visible code ("ES") inside it (WCAG 2.5.3).
export function toLanguageTriggerLabel(lang: Lang, texts: PreferenceTexts): string {
  return interpolate(texts.languageTrigger, LANGUAGE_OPTIONS[lang]);
}
