import { cn } from '@/shared/utils/cn.utils';
import type { SkeletonProps } from './Skeleton.types';

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'rounded-md bg-accent outline-none motion-safe:animate-pulse focus-visible:ring-3 focus-visible:ring-ring/60',
        className,
      )}
      {...props}
    />
  );
}
