import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium',
    'transition-[color,background-color,box-shadow,filter] select-none',
    // outline-hidden keeps a transparent outline that forced-colors mode paints (box-shadow rings are dropped there)
    'focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
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
        segment: [
          'rounded-full text-muted-foreground hover:text-foreground',
          // Pressed disc >= 3:1 against the control in both themes (WCAG 1.4.11)
          'aria-pressed:bg-primary aria-pressed:text-primary-foreground',
          'forced-colors:aria-pressed:bg-[Highlight] forced-colors:aria-pressed:text-[HighlightText]',
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
