import { KeyboardIcon } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { LANG_TAGS } from '@/shared/constants/i18n.constants';
import { Input } from '@/shared/ui';
import type { QueryFieldProps } from './QueryField.types';
import { counterVariants } from './QueryField.variants';

export function QueryField({
  value,
  maxLength,
  counter,
  focusRequestId,
  onValueChange,
  label,
  placeholder,
  clearAction,
}: QueryFieldProps) {
  const inputId = useId();
  const counterId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus is requested, never taken on mount (it would open the keyboard on phones): a history pick or the
  // clear button bump the id. The frame (the plan's choice) gives the effect a cleanup that cancels a focus
  // still pending when ids arrive back to back or the field unmounts. Whether iOS opens its keyboard for a
  // focus moved out of the tap is still to check on a device (phase 13).
  useEffect(() => {
    const frame = focusRequestId > 0 ? requestAnimationFrame(() => inputRef.current?.focus()) : undefined;
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [focusRequestId]);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <KeyboardIcon
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-4 size-6 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={inputRef}
          id={inputId}
          inputSize="lg"
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          lang={LANG_TAGS.en}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          aria-describedby={counterId}
          onChange={(event) => onValueChange(event.target.value)}
          // No clear button while empty: the placeholder gets that room back.
          className="h-14 pr-14 pl-13 placeholder-shown:pr-4 sm:h-16 sm:text-xl"
        />
        <div className="absolute inset-y-0 right-1.5 flex items-center">{clearAction}</div>
      </div>
      {/* Seen as "8 / 50", described as "8 de 50 caracteres" through aria-describedby. */}
      <p id={counterId} className={counterVariants({ tone: counter.tone })}>
        <span aria-hidden>{counter.text}</span>
        <span className="sr-only">{counter.description}</span>
      </p>
    </div>
  );
}
