import { cn } from '@/shared/utils/cn.utils';
import type { ButtonProps } from './Button.types';
import { buttonVariants } from './Button.variants';

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      data-slot="button"
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
