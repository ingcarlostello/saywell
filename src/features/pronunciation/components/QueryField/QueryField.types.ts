import type { ReactNode } from 'react';
import type { PronunciationFormView } from '@/features/pronunciation/types/pronunciation.types';

export interface QueryFieldProps
  extends Pick<PronunciationFormView, 'value' | 'maxLength' | 'counter' | 'focusRequestId' | 'onValueChange'> {
  label: string;
  placeholder: string;
  // The clear button, present only while there is text: the container decides, the field only places it.
  clearAction?: ReactNode;
}
