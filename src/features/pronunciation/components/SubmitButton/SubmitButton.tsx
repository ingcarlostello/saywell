import { LoaderCircleIcon, MicIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/shared/ui';
import type { SubmitButtonProps } from './SubmitButton.types';

// aria-disabled, not disabled: it stays focusable and is announced as unavailable, and the facade ignores the
// submit meanwhile. The spinner replaces the mic while the answer is on its way.
export function SubmitButton({ label, isSubmitting, isDisabled, focusRequestId }: SubmitButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Rescues the focus after a retry, whose button unmounts under the keyboard (WCAG 2.4.3); never on mount.
  // Only a focus actually lost (back on <body>) is taken: a retry that fails at once keeps its notice, and
  // its button keeps the focus.
  useEffect(() => {
    const rescueFocus = (): void => {
      if (document.activeElement === null || document.activeElement === document.body) buttonRef.current?.focus();
    };
    const frame = focusRequestId > 0 ? requestAnimationFrame(rescueFocus) : undefined;
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [focusRequestId]);

  return (
    <Button
      ref={buttonRef}
      type="submit"
      variant="brand"
      size="xl"
      aria-disabled={isDisabled}
      aria-busy={isSubmitting}
      className="w-full"
    >
      {isSubmitting ? (
        <LoaderCircleIcon className="size-5 motion-safe:animate-spin" aria-hidden />
      ) : (
        <MicIcon className="size-5" aria-hidden />
      )}
      {label}
    </Button>
  );
}
