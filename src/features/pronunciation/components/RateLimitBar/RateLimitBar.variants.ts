import { cva } from 'class-variance-authority';
import { HourglassIcon, ZapIcon, type LucideIcon } from 'lucide-react';
import type { RateLimitTone } from '@/features/pronunciation/types/rateLimit.types';

// default: more than 5 left (the mockup's blue bolt); warning: 1 to 5; blocked: 0, with the countdown.
export const rateLimitBarVariants = cva('flex items-center gap-3', {
  variants: {
    tone: {
      default: '',
      warning: 'border-warning/45',
      blocked: 'border-destructive/45',
    } satisfies Record<RateLimitTone, string>,
  },
});

export const rateLimitIconVariants = cva('size-5 shrink-0', {
  variants: {
    tone: {
      default: 'fill-current text-primary',
      warning: 'fill-current text-warning',
      blocked: 'text-destructive',
    } satisfies Record<RateLimitTone, string>,
  },
});

export const RATE_LIMIT_ICONS = {
  default: ZapIcon,
  warning: ZapIcon,
  blocked: HourglassIcon,
} as const satisfies Record<RateLimitTone, LucideIcon>;
