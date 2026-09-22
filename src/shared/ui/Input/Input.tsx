import { cn } from '@/shared/utils/cn.utils';
import type { InputProps } from './Input.types';
import { inputVariants } from './Input.variants';

export function Input({ className, inputSize, type = 'text', ...props }: InputProps) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(inputVariants({ inputSize }), className)}
      {...props}
    />
  );
}
