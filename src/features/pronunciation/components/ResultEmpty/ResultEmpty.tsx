import { SpeechIcon } from 'lucide-react';
import { Card } from '@/shared/ui';
import type { ResultEmptyProps } from './ResultEmpty.types';

export function ResultEmpty({ title, message }: ResultEmptyProps) {
  return (
    <Card variant="dashed" className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
        <SpeechIcon className="size-7" />
      </span>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-sm text-muted-foreground">{message}</p>
    </Card>
  );
}
