import { HistoryItem } from './HistoryItem/HistoryItem';
import type { HistoryListProps } from './HistoryList.types';

// The key is the case-insensitive word: unique after dedupe, never the index (anti-pattern #5).
export function HistoryList({ items }: HistoryListProps) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map(({ id, ...item }) => (
        <li key={id} className="py-1 first:pt-0 last:pb-0">
          <HistoryItem {...item} />
        </li>
      ))}
    </ul>
  );
}
