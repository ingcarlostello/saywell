import type { ReactNode } from 'react';

// Slots only: the layout places the regions, it never decides what goes in them.
export interface PronunciationLayoutProps {
  hero: ReactNode;
  form: ReactNode;
  result: ReactNode;
  rateLimit: ReactNode;
  history: ReactNode;
  aside?: ReactNode;
}
