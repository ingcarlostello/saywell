import { ChevronRightIcon, ClockIcon } from 'lucide-react';
import { LANG_TAGS } from '@/shared/constants/i18n.constants';
import { Button } from '@/shared/ui';
import type { HistoryItemProps } from './HistoryItem.types';

// Picking an entry fills the field and focuses it; it never asks again, which would spend quota. The entry
// of the answer on screen is `aria-current`, marked by an outline (≥ 3:1, and it survives forced colors)
// on top of the tint, which alone would equal the hover and fall under 3:1 (WCAG 1.4.1 / 1.4.11). The
// outline steps aside under keyboard focus, so the Button's own focus indicator is never overridden.
export function HistoryItem({ word, timeLabel, isActive, onSelect }: HistoryItemProps) {
  return (
    <Button
      variant="ghost"
      onClick={onSelect}
      aria-current={isActive}
      className="h-auto min-h-14 w-full justify-start gap-3 rounded-xl px-2 py-2 text-left aria-current:bg-accent aria-current:not-focus-visible:outline-2 aria-current:not-focus-visible:-outline-offset-2 aria-current:not-focus-visible:outline-primary forced-colors:aria-current:not-focus-visible:outline-[Highlight]"
    >
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background/40 text-muted-foreground"
      >
        <ClockIcon className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span lang={LANG_TAGS.en} className="truncate text-base font-medium">
          {word}
        </span>
        <span className="truncate text-sm font-normal text-muted-foreground">{timeLabel}</span>
      </span>
      <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
    </Button>
  );
}
