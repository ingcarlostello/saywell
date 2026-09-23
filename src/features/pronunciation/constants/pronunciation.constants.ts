import type { Localized } from '@/shared/types/i18n.types';
import type { BadgeVariant } from '@/shared/ui';
import type { PronunciationRequestState, PronunciationTexts } from '../types/pronunciation.types';

export const PRONUNCIATION_ENDPOINTS = { pronounce: '/api/pronounce' } as const;

// The device id identifies the rate-limit bucket; `api/pronounce.ts` reads it from this header.
export const PRONUNCIATION_HEADERS = { clientId: 'X-Client-Id' } as const;

// CONTRACT: `maxLength` mirrors INPUT.wordMaxLength in api/_lib/pronounce.constants.ts — a longer word is
// answered with 400; scripts/check-arch.mjs fails if they drift apart. `warningLength` is UI only: where
// the counter turns orange.
export const INPUT_LIMITS = { maxLength: 50, warningLength: 40 } as const;

export const COUNTER_LABEL_TEMPLATE = '{length} / {max}';

// Same collapsing the server applies before validating the word.
export const WHITESPACE_RUN_PATTERN = /\s+/g;

// Half of a surrogate pair left behind by a cut at the character limit; it renders as "�". Deliberately
// without the `u` flag: it has to match a single code unit, which is what the cut can leave.
export const TRAILING_HIGH_SURROGATE_PATTERN = /[\uD800-\uDBFF]$/;

export const RESULT_STATUS = { ok: 'ok', outOfScope: 'out_of_scope' } as const;

export const REQUEST_STATUS = { idle: 'idle', loading: 'loading', ready: 'ready', failed: 'failed' } as const;

export const REQUEST_ACTION = { start: 'start', succeed: 'succeed', fail: 'fail', cancel: 'cancel' } as const;

export const INITIAL_REQUEST_STATE = {
  status: REQUEST_STATUS.idle,
} as const satisfies PronunciationRequestState;

// Why a request produced no pronunciation. `aborted` is the UI replacing its own question and never reaches
// the reducer; `outOfScope` is the 422 prefilter (emojis, other scripts), shown like the LLM's own refusal.
export const FAILURE_KIND = {
  aborted: 'aborted',
  outOfScope: 'out_of_scope',
  rateLimited: 'rate_limited',
  failed: 'failed',
} as const;

export const FAILURE_REASON = { network: 'network', timeout: 'timeout', server: 'server' } as const;

export const RESULT_VIEW = { idle: 'idle', loading: 'loading', ready: 'ready', notice: 'notice' } as const;

export const NOTICE_TONE = { info: 'info', warning: 'warning', error: 'error' } as const;

export const COUNTER_TONE = { normal: 'normal', warning: 'warning', danger: 'danger' } as const;

// The stressed part is always indigo and the unstressed ones alternate sky/emerald, as in the mockup
// (de → sky, LI → indigo, verd → emerald). Color is never the only cue: uppercase and a sr-only label too.
export const STRESSED_SYLLABLE_VARIANT = 'indigo' satisfies BadgeVariant;
export const UNSTRESSED_SYLLABLE_VARIANTS = ['sky', 'emerald'] as const satisfies readonly BadgeVariant[];

// Titles and notices of the description (out of scope) are quoted literally.
export const PRONUNCIATION_TEXTS = {
  es: {
    hero: {
      title: { before: 'Mejora tu pronunciación en ', highlight: 'inglés', after: '' },
      subtitle: 'Escribe una palabra o frase y descubre cómo se pronuncia en inglés americano, explicado en español.',
      note: 'Habla mejor, con más confianza',
    },
    form: {
      field: 'Palabra o frase en inglés',
      placeholder: 'Escribe una palabra o frase en inglés',
      clear: 'Borrar texto',
      counter: '{length} de {max} caracteres',
      submit: 'Pronunciar',
      submitBlocked: 'Disponible en {minutes} min',
    },
    result: {
      idleTitle: 'Tu pronunciación aparecerá aquí',
      idleMessage: 'Escribe una palabra o frase en inglés y pulsa Pronunciar.',
      partsTitle: 'Cómo suena cada parte:',
      stressed: 'lleva el acento',
      listen: 'Escuchar',
      retry: 'Reintentar',
      announceLoading: 'Buscando la pronunciación…',
      announceReady: 'Pronunciación lista',
      announceNotice: '{title}. {message}',
    },
    notices: {
      outOfScope: {
        title: 'Fuera de mi alcance',
        message:
          'No estoy programado para eso — solo te ayudo con la pronunciación de palabras en inglés. Escribe una palabra o frase corta en inglés y te explico cómo suena.',
      },
      rateLimited: {
        title: 'Límite de consultas alcanzado',
        message: 'Has alcanzado el límite de {limit} consultas por hora. Intenta de nuevo en {minutes} min.',
      },
      rateLimitOver: {
        title: 'Ya puedes volver a consultar',
        message: 'Tu límite de consultas se ha renovado.',
      },
      failed: {
        network: { title: 'Sin conexión', message: 'Revisa tu internet e inténtalo de nuevo.' },
        timeout: {
          title: 'La respuesta tardó demasiado',
          message: 'El servicio no respondió a tiempo. Inténtalo de nuevo.',
        },
        server: {
          title: 'Algo falló',
          message: 'No pudimos obtener la pronunciación. Inténtalo de nuevo en un momento.',
        },
      },
    },
  },
  en: {
    hero: {
      title: { before: 'Improve your ', highlight: 'English', after: ' pronunciation' },
      subtitle: 'Type a word or phrase and find out how it is pronounced in American English, explained in plain English.',
      note: 'Speak better, with more confidence',
    },
    form: {
      field: 'English word or phrase',
      placeholder: 'Type an English word or phrase',
      clear: 'Clear text',
      counter: '{length} of {max} characters',
      submit: 'Pronounce',
      submitBlocked: 'Available in {minutes} min',
    },
    result: {
      idleTitle: 'Your pronunciation will appear here',
      idleMessage: 'Type an English word or phrase and press Pronounce.',
      partsTitle: 'How each part sounds:',
      stressed: 'stressed',
      listen: 'Listen',
      retry: 'Try again',
      announceLoading: 'Looking up the pronunciation…',
      announceReady: 'Pronunciation ready',
      announceNotice: '{title}. {message}',
    },
    notices: {
      outOfScope: {
        title: 'Out of scope',
        message:
          "I'm not programmed for that — I only help with English pronunciation. Type a short English word or phrase and I'll explain how it sounds.",
      },
      rateLimited: {
        title: 'Query limit reached',
        message: "You've reached the limit of {limit} queries per hour. Try again in {minutes} min.",
      },
      rateLimitOver: {
        title: 'You can ask again',
        message: 'Your query limit has been renewed.',
      },
      failed: {
        network: { title: 'No connection', message: 'Check your internet connection and try again.' },
        timeout: { title: 'That took too long', message: "The service didn't answer in time. Please try again." },
        server: { title: 'Something went wrong', message: "We couldn't get the pronunciation. Try again in a moment." },
      },
    },
  },
} as const satisfies Localized<PronunciationTexts>;
