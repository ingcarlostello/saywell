import type { Lang } from '@/shared/types/i18n.types';
import type { Theme } from '@/store';

export interface PreferenceTexts {
  themeGroup: string;
  themeLight: string;
  themeDark: string;
  languageTrigger: string;
}

export interface LanguageOption {
  code: string;
  name: string;
}

export interface DocumentPreference {
  theme: Theme;
  lang: Lang;
}

export interface ThemeOptionView {
  label: string;
  isActive: boolean;
  onSelect: () => void;
}

export interface ThemeControlView {
  groupLabel: string;
  options: Readonly<Record<Theme, ThemeOptionView>>;
}

export interface LanguageOptionView {
  id: Lang;
  name: string;
  onSelect: () => void;
}

export interface LanguageControlView {
  value: Lang;
  code: string;
  triggerLabel: string;
  options: readonly LanguageOptionView[];
}

export interface PreferenceFacade {
  theme: ThemeControlView;
  language: LanguageControlView;
}
