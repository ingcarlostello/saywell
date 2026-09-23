import { HistoryItem } from './HistoryItem/HistoryItem';
import type { HistoryListProps } from './HistoryList.types';

// The key is the case-insensitive word: unique after dedupe, never the index (anti-pattern #5).
// role="list": WebKit drops list semantics under list-style:none (Tailwind preflight).
export function HistoryList({ items }: HistoryListProps) {
  return (
    <ul role="list" className="flex flex-col divide-y divide-border">
      {items.map(({ id, ...item }) => (
        <li key={id} className="py-1 first:pt-0 last:pb-0">
          <HistoryItem {...item} />
        </li>
      ))}
    </ul>
  );
}
