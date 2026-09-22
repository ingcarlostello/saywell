import type { ReactNode } from 'react';
import type { ThemeOptionView } from '@/features/preference/types/preference.types';

export interface ThemeOptionProps extends ThemeOptionView {
  icon: ReactNode;
}
