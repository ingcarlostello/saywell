import { cn } from '@/shared/utils/cn.utils';
import type { CardProps } from './Card.types';
import { cardVariants } from './Card.variants';

export function Card({ className, variant, padding, ...props }: CardProps) {
  return <div data-slot="card" className={cn(cardVariants({ variant, padding }), className)} {...props} />;
}
