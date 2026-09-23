import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { HISTORY_PERSIST } from '../constants/history.constants';
import type { HistoryState, HistoryStore } from './historyStore.types';

const initialState: HistoryState = { entries: [] };

export const useHistoryStore = create<HistoryStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setEntries: (entries) => set({ entries }, false, 'history/setEntries'),
        reset: () => set(initialState, false, 'history/reset'),
      }),
      {
        name: HISTORY_PERSIST.key,
        version: HISTORY_PERSIST.version,
        storage: createJSONStorage(() => localStorage),
        partialize: ({ entries }) => ({ entries }),
      },
    ),
    { name: 'history', enabled: import.meta.env.DEV },
  ),
);
