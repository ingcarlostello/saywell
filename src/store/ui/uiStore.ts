import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { DEFAULT_LANG } from '@/shared/constants/i18n.constants';
import { DEFAULT_THEME, PERSIST_KEYS, PERSIST_VERSION } from '../store.constants';
import type { UiState, UiStore } from './uiStore.types';

const initialState: UiState = { theme: DEFAULT_THEME, lang: DEFAULT_LANG };

export const useUiStore = create<UiStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setTheme: (theme) => set({ theme }, false, 'ui/setTheme'),
        setLang: (lang) => set({ lang }, false, 'ui/setLang'),
        reset: () => set(initialState, false, 'ui/reset'),
      }),
      {
        name: PERSIST_KEYS.ui,
        version: PERSIST_VERSION.ui,
        storage: createJSONStorage(() => localStorage),
        partialize: ({ theme, lang }) => ({ theme, lang }),
      },
    ),
    { name: 'ui', enabled: import.meta.env.DEV },
  ),
);
