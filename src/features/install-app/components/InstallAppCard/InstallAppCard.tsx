import { DownloadIcon } from 'lucide-react';
import { Card } from '@/shared/ui';
import type { InstallAppCardProps } from './InstallAppCard.types';

// The mockup's promo card. No landmark (it already sits in the page's <aside> and comes and goes with browser
// events) and no live region: its arrival is not announced. Same insets as the history panel above it.
export function InstallAppCard({ title, description, children }: InstallAppCardProps) {
  return (
    <Card variant="promo" className="flex items-start gap-3 p-4 lg:p-5">
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-promo text-promo-foreground"
      >
        <DownloadIcon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col items-start gap-1.5">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        {children}
      </div>
    </Card>
  );
}
