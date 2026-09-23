import { Badge } from '@/shared/ui';
import type { SyllableListProps } from './SyllableList.types';
import { syllablePillVariants } from './SyllableList.variants';

// Title, pills and explanations are all in the language the answer was asked in. The rows share one grid
// (subgrid keeps the list semantics that `contents` would drop), so every explanation starts at the same x.
// The pill column is capped at 40 % and a long pill wraps, so one long word of a phrase cannot squeeze every
// explanation. Browsers without subgrid (Chromium < 117) fall back to a flex row per entry.
export function SyllableList({ title, stressedLabel, syllables, lang }: SyllableListProps) {
  return (
    <section lang={lang} className="flex flex-col gap-3">
      <h3 className="font-semibold sm:text-lg">{title}</h3>
      <ul className="grid grid-cols-[fit-content(40%)_minmax(0,1fr)] gap-x-4 gap-y-3">
        {syllables.map((syllable) => (
          <li
            key={syllable.id}
            className="col-span-full flex items-start gap-x-4 supports-[grid-template-columns:subgrid]:grid supports-[grid-template-columns:subgrid]:grid-cols-subgrid"
          >
            <Badge variant={syllable.variant} className={syllablePillVariants({ stressed: syllable.isStressed })}>
              {syllable.label}
              {syllable.isStressed && <span className="sr-only">, {stressedLabel}</span>}
            </Badge>
            <p className="min-w-0 pt-0.5 wrap-break-word text-foreground/90">
              <span aria-hidden>— </span>
              {syllable.explanation}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
