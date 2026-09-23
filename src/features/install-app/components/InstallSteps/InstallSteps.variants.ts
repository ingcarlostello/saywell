import { ShareIcon, SquarePlusIcon, type LucideIcon } from 'lucide-react';
import type { InstallStepId } from '@/features/install-app/types/installApp.types';

// The glyphs iOS draws on the Share button and on the "Add to Home Screen" row.
export const INSTALL_STEP_ICONS = {
  share: ShareIcon,
  'add-to-home': SquarePlusIcon,
} as const satisfies Record<InstallStepId, LucideIcon>;
