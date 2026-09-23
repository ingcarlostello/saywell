import type { ReactNode } from 'react';
import type { ResultCardView } from '@/features/pronunciation/types/pronunciation.types';

export interface ResultCardProps {
  card: ResultCardView;
  // The Listen button when the browser has an en-US voice; the container decides.
  listenAction?: ReactNode;
}
