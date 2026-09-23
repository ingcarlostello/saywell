import { Card } from '@/shared/ui';
import { ExampleQuote } from './ExampleQuote/ExampleQuote';
import type { ResultCardProps } from './ResultCard.types';
import { ResultHeader } from './ResultHeader/ResultHeader';
import { SyllableList } from './SyllableList/SyllableList';

// Enters with a short fade and slide; `motion-safe` gates the animation itself (see Popover). The card is
// remounted for every answer, since the skeleton replaces it while loading.
export function ResultCard({ card, listenAction }: ResultCardProps) {
  return (
    <Card
      variant="elevated"
      padding="lg"
      className="flex flex-col gap-6 fade-in slide-in-from-bottom-2 duration-300 motion-safe:animate-in"
    >
      <ResultHeader
        word={card.word}
        phonetic={card.phonetic}
        lang={card.lang}
        wordLang={card.wordLang}
        action={listenAction}
      />
      <SyllableList
        title={card.partsTitle}
        stressedLabel={card.stressedLabel}
        syllables={card.syllables}
        lang={card.lang}
      />
      <ExampleQuote example={card.example} lang={card.wordLang} />
    </Card>
  );
}
