import { InfoIcon } from 'lucide-react';
import { Button, Card, Popover, PopoverContent, PopoverTrigger } from '@/shared/ui';
import type { RateLimitBarProps } from './RateLimitBar.types';
import { RATE_LIMIT_ICONS, rateLimitBarVariants, rateLimitIconVariants } from './RateLimitBar.variants';

// The "i" opens a Popover rather than a tooltip: it has to work on touch. Radix renders it as a dialog, which
// needs a name (WCAG 4.1.2): the trigger's own label.
export function RateLimitBar({ tone, message, infoLabel, infoText }: RateLimitBarProps) {
  const Icon = RATE_LIMIT_ICONS[tone];
  return (
    <Card padding="sm" className={rateLimitBarVariants({ tone })}>
      <Icon aria-hidden className={rateLimitIconVariants({ tone })} />
      <p className="min-w-0 text-sm sm:text-base">{message}</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={infoLabel}
            className="-my-1.5 -ml-1 shrink-0 rounded-full text-muted-foreground"
          >
            <InfoIcon className="size-5" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" aria-label={infoLabel}>
          {infoText}
        </PopoverContent>
      </Popover>
    </Card>
  );
}
