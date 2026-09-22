import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center rounded-full border border-transparent font-semibold whitespace-nowrap',
    'outline-none focus-visible:ring-3 focus-visible:ring-ring/60',
  ],
  {
    variants: {
      variant: {
        phonetic: 'rounded-xl border-phonetic-border bg-phonetic text-phonetic-foreground',
        sky: 'bg-pill-sky text-pill-sky-foreground',
        indigo: 'bg-pill-indigo text-pill-indigo-foreground',
        emerald: 'bg-pill-emerald text-pill-emerald-foreground',
      },
      size: {
        sm: 'h-7 min-w-12 px-3 text-sm',
        lg: 'h-9 px-3 text-lg lg:h-11 lg:px-4 lg:text-2xl',
      },
    },
    defaultVariants: {
      variant: 'sky',
      size: 'sm',
    },
  },
);
