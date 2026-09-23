import { ArrowRightIcon } from 'lucide-react';
import { Button } from '@/shared/ui';
import type { HistoryToggleButtonProps } from './HistoryToggleButton.types';

// The arrow follows aria-expanded through CSS: "Ver todo →" collapsed, "Ver menos ↑" expanded.
export function HistoryToggleButton({ label, isExpanded, onToggle }: HistoryToggleButtonProps) {
  return (
    <Button
      variant="ghost"
      aria-expanded={isExpanded}
      onClick={onToggle}
      className="group -mr-2 shrink-0 gap-1.5 rounded-full px-3 text-primary"
    >
      {label}
      <ArrowRightIcon
        aria-hidden
        className="transition-transform group-aria-expanded:-rotate-90 motion-reduce:transition-none"
      />
    </Button>
  );
}
