import { ClockIcon } from 'lucide-react';
import type { HistoryEmptyProps } from './HistoryEmpty.types';

export function HistoryEmpty({ title, message }: HistoryEmptyProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-center">
      <ClockIcon className="size-8 text-muted-foreground" aria-hidden />
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
