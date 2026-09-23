import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { HISTORY_PERSIST, HISTORY_TEXTS, HISTORY_VIEW } from '../constants/history.constants';
import { addHistoryEntry, canToggleHistory, toHistoryItems, toSupportedHistory } from '../helpers/history.helper';
import { useHistoryStore } from '../store/historyStore';
import type { HistoryController, UseHistoryOptions } from '../types/history.types';
import { useStorageSync } from './useStorageSync';

export function useHistory({ now, lang, currentWord, selectWord }: UseHistoryOptions): HistoryController {
  const { storedEntries, setEntries } = useHistoryStore(
    useShallow((s) => ({ storedEntries: s.entries, setEntries: s.setEntries })),
  );
  const [isExpanded, setIsExpanded] = useState(false);
  useStorageSync(HISTORY_PERSIST.key, useHistoryStore);

  const entries = toSupportedHistory(storedEntries);
  const texts = HISTORY_TEXTS[lang];
  const items = toHistoryItems(entries, { now, lang, currentWord, isExpanded, texts }).map((item) => ({
    ...item,
    onSelect: () => selectWord(item.word),
  }));
  const toggle = canToggleHistory(entries)
    ? {
        label: isExpanded ? texts.showLess : texts.showAll,
        isExpanded,
        onToggle: () => setIsExpanded((expanded) => !expanded),
      }
    : undefined;

  return {
    view:
      entries.length === 0
        ? { kind: HISTORY_VIEW.empty, title: texts.title, empty: { title: texts.emptyTitle, message: texts.emptyMessage } }
        : { kind: HISTORY_VIEW.list, title: texts.title, items, toggle },
    // Read when the answer arrives, not from the render of the click: seconds pass in between, and another
    // tab may have written meanwhile.
    add: (word) =>
      setEntries(addHistoryEntry(toSupportedHistory(useHistoryStore.getState().entries), { word, askedAt: Date.now() })),
  };
}
