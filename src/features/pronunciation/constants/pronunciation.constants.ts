import type { Localized } from '@/shared/types/i18n.types';
import type { BadgeVariant } from '@/shared/ui';
import type { PronunciationRequestState, PronunciationTexts } from '../types/pronunciation.types';

export const PRONUNCIATION_ENDPOINTS = { pronounce: '/api/pronounce' } as const;

// The device id identifies the rate-limit bucket; `api/pronounce.ts` reads it from this header.
export const PRONUNCIATION_HEADERS = { clientId: 'X-Client-Id' } as const;

// CONTRACT: `maxLength` mirrors INPUT.wordMaxLength in api/_lib/pronounce.constants.ts — a longer word is
// answered with 400. `warningLength` is UI only: where the counter turns orange.
export const INPUT_LIMITS = { maxLength: 50, warningLength: 40 } as const;

export const COUNTER_LABEL_TEMPLATE = '{length} / {max}';

// Same collapsing the server applies before validating the word.
export const WHITESPACE_RUN_PATTERN = /\s+/g;

// Half of a surrogate pair left behind by a cut at the character limit; it renders as "�". Deliberately
// without the `u` flag: it has to match a single code unit, which is what the cut can leave.
export const TRAILING_HIGH_SURROGATE_PATTERN = /[\uD800-\uDBFF]$/;

export const RESULT_STATUS = { ok: 'ok', outOfScope: 'out_of_scope' } as const;

export const REQUEST_STATUS = { idle: 'idle', loading: 'loading', ready: 'ready', failed: 'failed' } as const;

export const REQUEST_ACTION = { start: 'start', succeed: 'succeed', fail: 'fail', reset: 'reset' } as const;

export const INITIAL_REQUEST_STATE = {
  status: REQUEST_STATUS.idle,
} as const satisfies PronunciationRequestState;

// What the result area shows. `outOfScope` is a successful answer, not an error.
export const RESULT_VIEW = {
  empty: 'empty',
  loading: 'loading',
  ready: 'ready',
  outOfScope: 'out_of_scope',
  error: 'error',
} as const;

export const COUNTER_TONE = { normal: 'normal', warning: 'warning', danger: 'danger' } as const;

export const PRONUNCIATION_ERROR = {
  network: 'network',
  timeout: 'timeout',
  unsupported: 'unsupported',
  rateLimited: 'rate_limited',
  server: 'server',
} as const;

// Pill colors cycle by position, as in the mockup (de → sky, LI → indigo, verd → emerald).
export const SYLLABLE_VARIANTS = ['sky', 'indigo', 'emerald'] as const satisfies readonly BadgeVariant[];

export const PRONUNCIATION_TEXTS = {
  es: {
    placeholder: 'Escribe una palabra o frase en inglés',
    clear: 'Borrar',
    submit: 'Pronunciar',
    loading: 'Buscando la pronunciación',
    partsHeading: 'Cómo suena cada parte:',
    stressed: 'sílaba tónica',
    outOfScope:
      'No estoy programado para eso — solo te ayudo con la pronunciación de palabras en inglés. Escribe una palabra o frase corta en inglés y te explico cómo suena.',
    retry: 'Reintentar',
    errors: {
      network: 'Sin conexión. Revisa tu internet e inténtalo de nuevo.',
      timeout: 'La respuesta tardó demasiado. Inténtalo de nuevo.',
      unsupported: 'Solo entiendo palabras o frases cortas en inglés.',
      rate_limited: 'Has agotado tus consultas de esta hora.',
      server: 'Algo falló de nuestro lado. Inténtalo de nuevo en un momento.',
    },
  },
  en: {
    placeholder: 'Type an English word or phrase',
    clear: 'Clear',
    submit: 'Pronounce',
    loading: 'Looking up the pronunciation',
    partsHeading: 'How each part sounds:',
    stressed: 'stressed syllable',
    outOfScope:
      "I'm not programmed for that — I only help with English pronunciation. Type a short English word or phrase and I'll explain how it sounds.",
    retry: 'Try again',
    errors: {
      network: 'No connection. Check your internet and try again.',
      timeout: 'That took too long. Please try again.',
      unsupported: 'I only understand short English words or phrases.',
      rate_limited: "You've used up this hour's queries.",
      server: 'Something went wrong on our side. Try again in a moment.',
    },
  },
} as const satisfies Localized<PronunciationTexts>;
