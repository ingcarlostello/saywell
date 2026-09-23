import { XIcon } from 'lucide-react';
import { Button } from '@/shared/ui';
import type { ClearFieldButtonProps } from './ClearFieldButton.types';

export function ClearFieldButton({ label, onClear }: ClearFieldButtonProps) {
  return (
    <Button variant="ghost" size="icon" aria-label={label} onClick={onClear} className="rounded-full text-muted-foreground">
      <XIcon className="size-5" aria-hidden />
    </Button>
  );
}
