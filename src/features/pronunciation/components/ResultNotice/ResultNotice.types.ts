import type { ReactNode } from 'react';
import type { NoticeView } from '@/features/pronunciation/types/pronunciation.types';

export interface ResultNoticeProps extends Omit<NoticeView, 'kind' | 'retry'> {
  // The retry button when it can work; the container decides.
  action?: ReactNode;
}
