import type { ReactNode } from 'react';
import type { ResultCardView } from '@/features/pronunciation/types/pronunciation.types';

export interface ResultHeaderProps extends Pick<ResultCardView, 'word' | 'phonetic' | 'lang' | 'wordLang'> {
  action?: ReactNode;
}
