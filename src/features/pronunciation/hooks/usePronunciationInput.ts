import { useState } from 'react';
import { truncateWord } from '../helpers/pronunciation.helper';
import type { PronunciationInputController } from '../types/pronunciation.types';
import { useFocusRequest } from './useFocusRequest';

// The field is shared by the form and the history. It asks for the focus after a history pick and after the
// clear button, which disappears once the field is empty.
export function usePronunciationInput(): PronunciationInputController {
  const [value, setValue] = useState('');
  const focus = useFocusRequest();

  return {
    value,
    focusRequestId: focus.id,
    setValue: (next) => setValue(truncateWord(next)),
    clear: () => {
      setValue('');
      focus.request();
    },
    fill: (word) => {
      setValue(truncateWord(word));
      focus.request();
    },
  };
}
