import { useEffect } from 'react';
import { DOCUMENT_THEME, THEME_META_COLORS } from '../constants/preference.constants';
import { isDarkTheme } from '../helpers/preference.helper';
import type { DocumentPreference } from '../types/preference.types';

// Mirrors the preference on <html> after every change. The boot script of index.html applies the same
// values before React mounts (no flash); `color-scheme` follows the `.dark` class through index.css.
export function useDocumentPreference({ theme, lang }: DocumentPreference): void {
  useEffect(() => {
    document.documentElement.classList.toggle(DOCUMENT_THEME.darkClass, isDarkTheme(theme));
    const themeColor = document.querySelector<HTMLMetaElement>(DOCUMENT_THEME.themeColorSelector);
    if (themeColor) themeColor.content = THEME_META_COLORS[theme];
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}
