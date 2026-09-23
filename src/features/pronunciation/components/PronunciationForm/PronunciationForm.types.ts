import type { ReactNode } from 'react';

export interface PronunciationFormProps {
  field: ReactNode;
  submit: ReactNode;
  onSubmit: () => void;
}
