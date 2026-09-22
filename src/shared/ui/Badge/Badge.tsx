import { cn } from '@/shared/utils/cn.utils';
import type { BadgeProps } from './Badge.types';
import { badgeVariants } from './Badge.variants';

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
