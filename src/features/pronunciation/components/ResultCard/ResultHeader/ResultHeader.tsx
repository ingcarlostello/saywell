import { AudioLinesIcon } from 'lucide-react';
import { Badge } from '@/shared/ui';
import type { ResultHeaderProps } from './ResultHeader.types';

// The green disc is decorative: sound waves rather than the mockup's speaker, so it does not look like a
// second, dead Listen button. The phonetic is spelled for the language it was asked in, hence its `lang`;
// it wraps for long phrases instead of overflowing the pill.
export function ResultHeader({ word, phonetic, lang, wordLang, action }: ResultHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-4">
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground sm:size-16"
        >
          <AudioLinesIcon className="size-7" />
        </span>
        <div className="flex min-w-0 flex-col items-start gap-2">
          <h2 lang={wordLang} className="text-3xl leading-tight font-bold wrap-break-word sm:text-4xl">
            {word}
          </h2>
          <Badge
            variant="phonetic"
            size="lg"
            lang={lang}
            className="h-auto min-h-9 py-1 whitespace-normal wrap-break-word lg:h-auto lg:min-h-11"
          >
            {phonetic}
          </Badge>
        </div>
      </div>
      {action}
    </div>
  );
}
