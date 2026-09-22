import type { Lang } from '@/shared/types/i18n.types';
import type { THEMES } from '../store.constants';

export type Theme = (typeof THEMES)[number];

export interface UiState {
  theme: Theme;
  lang: Lang;
}

export interface UiStore extends UiState {
  setTheme: (theme: Theme) => void;
  setLang: (lang: Lang) => void;
  reset: () => void;
}
