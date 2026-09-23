import { QuoteIcon } from 'lucide-react';
import type { ExampleQuoteProps } from './ExampleQuote.types';

// A raised panel with the mockup's opening quote mark in a disc (lucide draws a closing one: rotated). <q>
// adds the quotation marks of its own language (“…” for English); the server strips the ones the model added.
export function ExampleQuote({ example, lang }: ExampleQuoteProps) {
  return (
    <figure className="flex items-center gap-3 rounded-xl border border-border bg-accent px-4 py-3.5 sm:px-5">
      <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
        <QuoteIcon className="size-4 rotate-180 fill-current text-foreground" />
      </span>
      <p lang={lang} className="min-w-0 italic">
        <q>{example}</q>
      </p>
    </figure>
  );
}
