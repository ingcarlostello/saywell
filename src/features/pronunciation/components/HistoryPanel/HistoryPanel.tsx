import { HistoryIcon } from 'lucide-react';
import { useId } from 'react';
import { Card } from '@/shared/ui';
import type { HistoryPanelProps } from './HistoryPanel.types';

// A named region, so screen readers can jump to the history from the landmarks list.
export function HistoryPanel({ title, toggle, children }: HistoryPanelProps) {
  const titleId = useId();
  return (
    <Card role="region" aria-labelledby={titleId} className="flex flex-col gap-3 p-4 lg:p-5">
      <div className="flex min-h-11 items-center justify-between gap-3">
        <h2 id={titleId} className="flex items-center gap-3 text-lg font-semibold sm:text-xl">
          <HistoryIcon className="size-6 shrink-0 text-muted-foreground" aria-hidden />
          {title}
        </h2>
        {toggle}
      </div>
      {children}
    </Card>
  );
}
