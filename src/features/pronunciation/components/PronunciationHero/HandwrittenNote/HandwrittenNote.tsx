import type { HandwrittenNoteProps } from './HandwrittenNote.types';

// The tilted Caveat annotation of the mockup, with its arrow curling down towards the wave. The text carries
// its own line break (pre-line), as a handwritten note would.
export function HandwrittenNote({ text }: HandwrittenNoteProps) {
  return (
    <p className="flex -rotate-6 flex-col font-hand text-2xl leading-tight whitespace-pre-line text-foreground/85">
      {text}
      <svg viewBox="0 0 40 48" fill="none" aria-hidden focusable="false" className="mt-1 ml-4 h-10 w-8">
        <path d="M32 2C30 18 22 30 7 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 28v10h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </p>
  );
}
