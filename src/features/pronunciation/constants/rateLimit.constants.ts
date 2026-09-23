import type { Localized } from '@/shared/types/i18n.types';
import type { RateLimitTexts } from '../types/rateLimit.types';

export const MS_PER_MINUTE = 60_000;

// CONTRACT: mirror RATE_LIMIT.clientLimit and RATE_LIMIT.windowMs in api/_lib/pronounce.constants.ts;
// scripts/check-arch.mjs fails if they drift apart. They fill the gaps (the quota shown before the first
// answer, a 429 without Retry-After) and bound the cached snapshot: no server window lasts longer.
export const RATE_LIMIT_DEFAULTS = { limit: 30, windowMs: 3_600_000 } as const;

// Slack when judging a cached `resetAt`: `now` lags up to one tick behind the clock that anchored it, and
// Retry-After rounds up to whole seconds.
export const RATE_LIMIT_CLOCK_TOLERANCE_MS = 60_000;

// From this many queries left the bar turns to warning; at 0 it is blocked.
export const RATE_LIMIT_LOW_THRESHOLD = 5;

export const RATE_LIMIT_TONE = { default: 'default', warning: 'warning', blocked: 'blocked' } as const;

// The countdown is shown in minutes, so a 30 s tick keeps it at most half a minute behind.
export const RATE_LIMIT_TICK_MS = 30_000;

export const RATE_LIMIT_PERSIST = { key: 'saywell:rate-limit', version: 1 } as const;

// What `z.uuidv4()` accepts on the server: a device id that drifted from it would be answered 400 forever.
export const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const PLURAL_ONE = 'one' satisfies Intl.LDMLPluralRule;

// The window is one hour long and starts with the first query (CLAUDE.md §5), so no text promises a fixed
// clock time.
export const RATE_LIMIT_TEXTS = {
  es: {
    remaining: {
      one: 'Te queda {remaining} de {limit} consultas esta hora',
      other: 'Te quedan {remaining} de {limit} consultas esta hora',
    },
    exhausted: 'Espera {minutes} min para volver a consultar',
    infoLabel: 'Cómo funciona el límite de consultas',
    infoText: 'Puedes hacer {limit} consultas por hora. La hora empieza a contar con tu primera consulta.',
  },
  en: {
    remaining: {
      one: '{remaining} of {limit} queries left this hour',
      other: '{remaining} of {limit} queries left this hour',
    },
    exhausted: 'Wait {minutes} min before asking again',
    infoLabel: 'How the query limit works',
    infoText: 'You can make {limit} queries per hour. The hour starts counting with your first query.',
  },
} as const satisfies Localized<RateLimitTexts>;
