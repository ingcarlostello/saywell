import { Card } from '@/shared/ui';
import type { PronunciationFormProps } from './PronunciationForm.types';

// A native form so Enter submits. The facade guards the submit: the button uses aria-disabled, which keeps
// it focusable, so the form can still fire while the button reads as unavailable.
export function PronunciationForm({ field, submit, onSubmit }: PronunciationFormProps) {
  return (
    <Card variant="elevated" padding="none" className="p-4 sm:p-5">
      <form
        role="search"
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {field}
        {submit}
      </form>
    </Card>
  );
}
