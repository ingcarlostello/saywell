import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  [
    'w-full min-w-0 rounded-lg border border-input bg-transparent px-3 text-base text-foreground shadow-xs',
    'transition-[color,box-shadow,border-color] placeholder:text-muted-foreground dark:bg-background/40',
    // The border turning `ring` is the 3:1 indicator; the halo is decorative. outline-hidden: forced colors.
    'focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-ring/40',
    'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive',
  ],
  {
    variants: {
      inputSize: {
        default: 'h-11',
        lg: 'h-14 rounded-xl text-lg',
      },
    },
    defaultVariants: {
      inputSize: 'default',
    },
  },
);
