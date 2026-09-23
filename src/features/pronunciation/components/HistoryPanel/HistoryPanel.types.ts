import type { ReactNode } from 'react';

export interface HistoryPanelProps {
  title: string;
  // "Ver todo / Ver menos", only past 8 entries; the container decides.
  toggle?: ReactNode;
  // The list or the empty state.
  children: ReactNode;
}
