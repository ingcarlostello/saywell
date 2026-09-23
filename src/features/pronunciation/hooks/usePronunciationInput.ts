import { useState } from 'react';
import { truncateWord } from '../helpers/pronunciation.helper';
import type { PronunciationInputController } from '../types/pronunciation.types';

// The field is shared by the form and the history. `focusRequestId` grows each time the field must take the
// focus (a history pick, the clear button, which disappears once the field is empty).
export function usePronunciationInput(): PronunciationInputController {
  const [value, setValue] = useState('');
  const [focusRequestId, setFocusRequestId] = useState(0);
  const requestFocus = (): void => setFocusRequestId((id) => id + 1);

  return {
    value,
    focusRequestId,
    setValue: (next) => setValue(truncateWord(next)),
    clear: () => {
      setValue('');
      requestFocus();
    },
    fill: (word) => {
      setValue(truncateWord(word));
      requestFocus();
    },
  };
}
