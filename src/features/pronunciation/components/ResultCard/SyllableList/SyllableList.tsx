import { Badge } from '@/shared/ui';
import type { SyllableListProps } from './SyllableList.types';
import { syllablePillVariants } from './SyllableList.variants';

// Title, pills and explanations are all in the language the answer was asked in. The rows share one grid
// (subgrid keeps the list semantics that `contents` would drop), so every explanation starts at the same x.
// role="list": WebKit drops list semantics under list-style:none (Tailwind preflight).
// The pill column is capped at 40 % (never below 8.5rem, so an ordinary syllable such as STRENGTHS stays on one
// line on a 320 px phone) and a longer pill wraps, so one long word of a phrase cannot squeeze every explanation. Browsers without subgrid (Chromium < 117) fall back to a flex row per entry.
export function SyllableList({ title, stressedLabel, syllables, lang }: SyllableListProps) {
  return (
    <section lang={lang} className="flex flex-col gap-3">
      <h3 className="font-semibold sm:text-lg">{title}</h3>
      <ul role="list" className="grid grid-cols-[fit-content(max(40%,8.5rem))_minmax(0,1fr)] gap-x-4 gap-y-3">
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
