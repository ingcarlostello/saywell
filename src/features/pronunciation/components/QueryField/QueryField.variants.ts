import { cva } from 'class-variance-authority';
import type { CounterTone } from '@/features/pronunciation/types/pronunciation.types';

// Orange from 40 characters and red at the 50 limit (the spec); weight changes too, so color is not the
// only cue.
export const counterVariants = cva('text-right text-sm tabular-nums', {
  variants: {
    tone: {
      normal: 'text-muted-foreground',
      warning: 'font-medium text-warning',
      danger: 'font-semibold text-destructive',
    } satisfies Record<CounterTone, string>,
  },
});
