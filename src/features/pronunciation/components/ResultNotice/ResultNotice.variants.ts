import { cva } from 'class-variance-authority';
import { HourglassIcon, InfoIcon, TriangleAlertIcon, type LucideIcon } from 'lucide-react';
import type { NoticeTone } from '@/features/pronunciation/types/pronunciation.types';

// info: out of scope and "you can ask again"; warning: the 429 countdown; error: network, timeout, server.
export const noticeVariants = cva('flex flex-col gap-4 sm:flex-row sm:items-start', {
  variants: {
    tone: {
      info: 'border-info/40',
      warning: 'border-warning/45',
      error: 'border-destructive/45',
    } satisfies Record<NoticeTone, string>,
  },
});

export const noticeIconVariants = cva('flex size-11 shrink-0 items-center justify-center rounded-full', {
  variants: {
    tone: {
      info: 'bg-info/15 text-info',
      warning: 'bg-warning/15 text-warning',
      error: 'bg-destructive/15 text-destructive',
    } satisfies Record<NoticeTone, string>,
  },
});

export const NOTICE_ICONS = {
  info: InfoIcon,
  warning: HourglassIcon,
  error: TriangleAlertIcon,
} as const satisfies Record<NoticeTone, LucideIcon>;
