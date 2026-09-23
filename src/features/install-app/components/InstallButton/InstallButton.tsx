import { ArrowRightIcon } from 'lucide-react';
import { Button } from '@/shared/ui';
import type { InstallButtonProps } from './InstallButton.types';

// A text CTA like "Ver todo →" in the same aside; a <button>, because prompt() needs this click's activation.
// In forced colors a border keeps the card's only action from reading as body text.
export function InstallButton({ label, onInstall }: InstallButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onInstall}
      className="-ml-3 gap-1.5 rounded-full px-3 text-primary forced-colors:border forced-colors:border-[ButtonText]"
    >
      {label}
      <ArrowRightIcon aria-hidden />
    </Button>
  );
}
