import type { HistoryEntry } from '../types/history.types';

export interface HistoryState {
  entries: readonly HistoryEntry[];
}

// No logic here: useHistory applies `addHistoryEntry` and hands the result to `setEntries`.
export interface HistoryStore extends HistoryState {
  setEntries: (entries: readonly HistoryEntry[]) => void;
  reset: () => void;
}
