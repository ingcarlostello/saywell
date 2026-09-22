import { cn } from '@/shared/utils/cn.utils';
import type { LiveRegionProps } from './LiveRegion.types';

// Visually hidden polite announcer for screen readers (one per page region).
export function LiveRegion({ className, ...props }: LiveRegionProps) {
  return (
    <p
      data-slot="live-region"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn('sr-only outline-none focus-visible:ring-3 focus-visible:ring-ring/60', className)}
      {...props}
    />
  );
}
