import { useShallow } from 'zustand/react/shallow';
import { LANGS } from '@/shared/constants/i18n.constants';
import { toSupportedLang } from '@/shared/utils/i18n.utils';
import { THEME, useUiStore } from '@/store';
import { LANGUAGE_OPTIONS, PREFERENCE_TEXTS } from '../constants/preference.constants';
import { toLanguageTriggerLabel, toSupportedTheme } from '../helpers/preference.helper';
import type { PreferenceFacade } from '../types/preference.types';
import { useDocumentPreference } from './useDocumentPreference';

export function usePreference(): PreferenceFacade {
  const { storedTheme, storedLang, setTheme, setLang } = useUiStore(
    useShallow((s) => ({ storedTheme: s.theme, storedLang: s.lang, setTheme: s.setTheme, setLang: s.setLang })),
  );
  const theme = toSupportedTheme(storedTheme);
  const lang = toSupportedLang(storedLang);
  useDocumentPreference({ theme, lang });
  const texts = PREFERENCE_TEXTS[lang];

  return {
    theme: {
      groupLabel: texts.themeGroup,
      options: {
        light: { label: texts.themeLight, isActive: theme === THEME.light, onSelect: () => setTheme(THEME.light) },
        dark: { label: texts.themeDark, isActive: theme === THEME.dark, onSelect: () => setTheme(THEME.dark) },
      },
    },
    language: {
      value: lang,
      code: LANGUAGE_OPTIONS[lang].code,
      triggerLabel: toLanguageTriggerLabel(lang, texts),
      options: LANGS.map((id) => ({ id, name: LANGUAGE_OPTIONS[id].name, onSelect: () => setLang(id) })),
    },
  };
}
