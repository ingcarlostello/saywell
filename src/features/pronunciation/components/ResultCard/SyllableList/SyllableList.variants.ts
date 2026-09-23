import { cva } from 'class-variance-authority';

// The stressed part is not told by color alone: its uppercase comes from the model, this ring and a sr-only
// label complete it. The ring is the pill's strong indigo in light (its pale fill would vanish on a white
// card) and the fill itself in dark. Labels at 16 px, as in the mockup; a long part (one word of a phrase)
// wraps at its hyphens inside the capped column instead of forcing it wider. `wrap-anywhere`, not `break-word`:
// in this inline-flex pill only it lowers the min-content width, so a part without hyphens cannot widen the column.
export const syllablePillVariants = cva('h-auto min-h-7 min-w-16 py-0.5 text-center text-base wrap-anywhere whitespace-normal', {
  variants: {
    stressed: {
      true: 'ring-2 ring-pill-indigo-foreground ring-offset-2 ring-offset-card-elevated dark:ring-pill-indigo',
      false: '',
    },
  },
});
