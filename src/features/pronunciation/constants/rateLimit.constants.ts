import type { Localized } from '@/shared/types/i18n.types';
import type { RateLimitTexts } from '../types/rateLimit.types';

export const MS_PER_MINUTE = 60_000;

// The window is one hour long and starts with the first query (CLAUDE.md §5), so the hint never promises
// a fixed clock time.
export const RATE_LIMIT_TEXTS = {
  es: {
    remaining: 'Te quedan {remaining} de {limit} consultas esta hora',
    exhausted: 'Espera {minutes} min para volver a consultar',
    hint: 'El límite se renueva una hora después de tu primera consulta.',
  },
  en: {
    remaining: '{remaining} of {limit} queries left this hour',
    exhausted: 'Wait {minutes} min before asking again',
    hint: 'The limit resets one hour after your first query.',
  },
} as const satisfies Localized<RateLimitTexts>;
