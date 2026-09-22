import { cva } from 'class-variance-authority';

export const cardVariants = cva(
  'rounded-2xl border border-border text-card-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/60',
  {
    variants: {
      variant: {
        default: 'bg-card',
        elevated: 'bg-card-elevated shadow-xl shadow-black/5 dark:shadow-black/30',
        dashed: 'border-dashed bg-card/60',
        promo: 'border-promo/35 bg-linear-to-br from-promo/10 to-promo/5 dark:from-promo/15',
      },
      padding: {
        none: '',
        sm: 'px-4 py-3',
        md: 'p-4 md:p-6',
        lg: 'p-4 sm:p-6 lg:p-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  },
);
