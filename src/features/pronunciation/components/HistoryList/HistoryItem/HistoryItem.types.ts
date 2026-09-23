import type { HistoryItemView } from '@/features/pronunciation/types/history.types';

// `id` is the list's key, one level up: the item itself never reads it (§13.8 ISP).
export interface HistoryItemProps extends Omit<HistoryItemView, 'id'> {}
