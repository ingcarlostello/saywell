import { Volume2Icon } from 'lucide-react';
import { Button } from '@/shared/ui';
import type { ListenButtonProps } from './ListenButton.types';

// Speech starts inside this click: iOS only lets a user gesture start it. UI chrome, so it sits outside the
// card's `lang` regions and inherits the page language. A filled chip, set off from the card as in the
// mockup; the fill is already the outline variant's hover, so hover moves it further from the card: darker
// on the white light card, brighter on the dark one.
export function ListenButton({ label, onListen }: ListenButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={onListen}
      className="shrink-0 rounded-full bg-accent hover:brightness-95 dark:border-input/40 dark:hover:brightness-125"
    >
      <Volume2Icon aria-hidden />
      {label}
    </Button>
  );
}
