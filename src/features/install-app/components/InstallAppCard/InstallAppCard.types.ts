import type { ReactNode } from 'react';
import type { InstallCardView } from '@/features/install-app/types/installApp.types';

export interface InstallAppCardProps extends InstallCardView {
  // The install button or the iOS steps; the container decides.
  children: ReactNode;
}
