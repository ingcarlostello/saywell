import { RotateCcwIcon } from 'lucide-react';
import { Button } from '@/shared/ui';
import type { RetryButtonProps } from './RetryButton.types';

export function RetryButton({ label, onRetry }: RetryButtonProps) {
  return (
    <Button variant="outline" onClick={onRetry} className="mt-1 rounded-full">
      <RotateCcwIcon aria-hidden />
      {label}
    </Button>
  );
}
