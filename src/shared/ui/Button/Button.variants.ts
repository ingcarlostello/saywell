import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium',
    'transition-[color,background-color,box-shadow,filter] outline-none select-none',
    'focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-60',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        brand: [
          'bg-linear-to-r from-brand-from to-brand-to font-semibold text-white shadow-lg shadow-brand-to/25',
          'hover:brightness-110 aria-disabled:hover:brightness-100',
          'forced-colors:border forced-colors:border-[ButtonText]',
        ],
        outline: 'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'px-0 text-primary underline-offset-4 hover:underline',
        segment: [
          'rounded-full text-muted-foreground hover:text-foreground',
          'aria-pressed:bg-accent aria-pressed:text-foreground aria-pressed:shadow-sm',
        ],
      },
      size: {
        default: 'h-11 px-4',
        xl: 'h-14 rounded-xl px-6 text-lg',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
