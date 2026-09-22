import { cn } from '@/shared/utils/cn.utils';
import type { SkeletonProps } from './Skeleton.types';

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'rounded-md bg-accent motion-safe:animate-pulse focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-ring',
        className,
      )}
      {...props}
    />
  );
}
