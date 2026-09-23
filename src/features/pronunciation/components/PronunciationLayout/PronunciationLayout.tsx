import type { PronunciationLayoutProps } from './PronunciationLayout.types';

// Phones read one column (hero → form → result → quota → history → aside). From md the history and the aside
// move to a side column that widens at lg and xl, as in the mockup.
export function PronunciationLayout({ hero, form, result, rateLimit, history, aside }: PronunciationLayoutProps) {
  return (
    <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_17.5rem] md:gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_25rem]">
      <div className="flex min-w-0 flex-col gap-5 md:gap-6">
        {hero}
        {form}
        {result}
        {rateLimit}
      </div>
      <aside className="flex min-w-0 flex-col gap-5 md:gap-6">
        {history}
        {aside}
      </aside>
    </div>
  );
}
