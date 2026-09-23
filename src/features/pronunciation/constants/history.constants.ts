import type { Localized } from '@/shared/types/i18n.types';
import type { HistoryTexts } from '../types/history.types';

export const HISTORY_LIMITS = { max: 20, preview: 8 } as const;

export const HISTORY_VIEW = { empty: 'empty', list: 'list' } as const;

export const HISTORY_PERSIST = { key: 'saywell:history', version: 1 } as const;

// `es` + hour12 renders "12:34 p. m." like the mockup; LANG_TAGS picks the locale.
export const HISTORY_TIME_FORMAT = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
} as const satisfies Intl.DateTimeFormatOptions;

// Older than yesterday: "20 sept" / "Sep 20", and the year once it is not the current one (the list has no
// age limit, so last year's entry must not read as last week's).
export const HISTORY_DATE_FORMAT = { day: 'numeric', month: 'short' } as const satisfies Intl.DateTimeFormatOptions;
export const HISTORY_DATE_WITH_YEAR_FORMAT = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
} as const satisfies Intl.DateTimeFormatOptions;

export const MS_PER_DAY = 86_400_000;

export const HISTORY_TEXTS = {
  es: {
    title: 'Historial',
    showAll: 'Ver todo',
    showLess: 'Ver menos',
    today: 'Hoy',
    yesterday: 'Ayer',
    timeLabel: '{day}, {time}',
    emptyTitle: 'Aún no hay consultas',
    emptyMessage: 'Las palabras que consultes aparecerán aquí.',
  },
  en: {
    title: 'History',
    showAll: 'View all',
    showLess: 'View less',
    today: 'Today',
    yesterday: 'Yesterday',
    timeLabel: '{day}, {time}',
    emptyTitle: 'No searches yet',
    emptyMessage: 'The words you look up will show up here.',
  },
} as const satisfies Localized<HistoryTexts>;
