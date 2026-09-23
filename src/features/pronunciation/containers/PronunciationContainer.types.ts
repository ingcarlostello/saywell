import type { ReactNode } from 'react';

// `aside` is what app/ composes under the history (the install card of the install-app feature): features
// never import each other.
export interface PronunciationContainerProps {
  aside?: ReactNode;
}
