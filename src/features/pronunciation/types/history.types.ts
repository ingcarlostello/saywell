import type { Lang } from '@/shared/types/i18n.types';
import type { HISTORY_VIEW } from '../constants/history.constants';

// Only answered pronunciations (`ok`) are recorded. The key of an entry is its word, case-insensitive:
// derivable, so it is not stored.
export interface HistoryEntry {
  word: string;
  askedAt: number;
}

export interface HistoryTexts {
  title: string;
  showAll: string;
  showLess: string;
  today: string;
  yesterday: string;
  timeLabel: string;
  emptyTitle: string;
  emptyMessage: string;
}

export interface HistoryItemsContext {
  now: number;
  lang: Lang;
  currentWord: string | undefined;
  isExpanded: boolean;
  texts: HistoryTexts;
}

export interface HistoryItemData {
  id: string;
  word: string;
  timeLabel: string;
  isActive: boolean;
}

export interface HistoryItemView extends HistoryItemData {
  onSelect: () => void;
}

export interface HistoryToggleView {
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export interface HistoryEmptyView {
  title: string;
  message: string;
}

// Empty and list are mutually exclusive (§13.4); `title` heads the panel in both.
export type HistoryView =
  | { kind: typeof HISTORY_VIEW.empty; title: string; empty: HistoryEmptyView }
  | { kind: typeof HISTORY_VIEW.list; title: string; items: readonly HistoryItemView[]; toggle?: HistoryToggleView };

export interface UseHistoryOptions {
  now: number;
  lang: Lang;
  currentWord: string | undefined;
  selectWord: (word: string) => void;
}

export interface HistoryController {
  view: HistoryView;
  add: (word: string) => void;
}
