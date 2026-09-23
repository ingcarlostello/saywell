import { API_ERROR_KIND } from '@/shared/api/api.constants';
import { ApiError } from '@/shared/api/ApiError';
import { interpolate } from '@/shared/utils/i18n.utils';
import {
  COUNTER_LABEL_TEMPLATE,
  COUNTER_TONE,
  INITIAL_REQUEST_STATE,
  INPUT_LIMITS,
  PRONUNCIATION_ERROR,
  REQUEST_ACTION,
  REQUEST_STATUS,
  SYLLABLE_VARIANTS,
  TRAILING_HIGH_SURROGATE_PATTERN,
  WHITESPACE_RUN_PATTERN,
} from '../constants/pronunciation.constants';
import type {
  CounterTone,
  PronunciationErrorKind,
  PronunciationPart,
  PronunciationRequestAction,
  PronunciationRequestState,
  SyllableView,
} from '../types/pronunciation.types';

// ── The word the user types ──────────────────────────────────────────────────────────────────────────────

// The same normalization the server applies before validating, so both sides agree on what was asked.
export function normalizeWord(value: string): string {
  return value.replace(WHITESPACE_RUN_PATTERN, ' ').trim();
}

// Pasting a longer text truncates instead of being rejected. Counted in UTF-16 units, like the server's
// `max(50)`, so the counter never disagrees with the 400 the server would answer; the cut only gives back
// the code unit that would be left hanging in the middle of a surrogate pair.
export function truncateWord(value: string): string {
  if (value.length <= INPUT_LIMITS.maxLength) return value;
  return value.slice(0, INPUT_LIMITS.maxLength).replace(TRAILING_HIGH_SURROGATE_PATTERN, '');
}

// Empty, or only whitespace once normalized: there is nothing to ask for.
export function isSubmittableWord(value: string): boolean {
  return normalizeWord(value).length > 0;
}

export function toCounterLabel(length: number): string {
  return interpolate(COUNTER_LABEL_TEMPLATE, { length, max: INPUT_LIMITS.maxLength });
}

export function toCounterTone(length: number): CounterTone {
  if (length >= INPUT_LIMITS.maxLength) return COUNTER_TONE.danger;
  if (length >= INPUT_LIMITS.warningLength) return COUNTER_TONE.warning;
  return COUNTER_TONE.normal;
}

// ── The answer ───────────────────────────────────────────────────────────────────────────────────────────

// Pill colors cycle by position, as in the mockup; the stress is carried by `isStressed` and by the
// uppercase the model already wrote, never by the color.
export function toSyllableViews(parts: readonly PronunciationPart[]): SyllableView[] {
  return parts.map((part, index) => ({
    id: part.id,
    label: part.syllable,
    explanation: part.explanation,
    isStressed: part.stressed,
    // The modulo is always in range; the fallback only satisfies noUncheckedIndexedAccess.
    variant: SYLLABLE_VARIANTS[index % SYLLABLE_VARIANTS.length] ?? SYLLABLE_VARIANTS[0],
  }));
}

// ── Errors ───────────────────────────────────────────────────────────────────────────────────────────────

// An abort is the UI replacing its own question, not a failure: it has no message to show.
export function isAbortedRequest(error: unknown): boolean {
  return error instanceof ApiError && error.kind === API_ERROR_KIND.aborted;
}

// Transport error → the message the user reads. Anything unmodelled reads as a server failure: it is the
// only honest thing to say about an error we did not foresee.
export function toPronunciationError(error: unknown): PronunciationErrorKind {
  if (!(error instanceof ApiError)) return PRONUNCIATION_ERROR.server;
  switch (error.kind) {
    case API_ERROR_KIND.network:
      return PRONUNCIATION_ERROR.network;
    case API_ERROR_KIND.timeout:
      return PRONUNCIATION_ERROR.timeout;
    case API_ERROR_KIND.unprocessable:
      return PRONUNCIATION_ERROR.unsupported;
    case API_ERROR_KIND.rateLimited:
      return PRONUNCIATION_ERROR.rateLimited;
    default:
      return PRONUNCIATION_ERROR.server;
  }
}

// ── Request lifecycle ────────────────────────────────────────────────────────────────────────────────────

// A late answer is dropped: only the request still in flight may finish.
function isStale(state: PronunciationRequestState, word: string): boolean {
  return state.status !== REQUEST_STATUS.loading || state.word !== word;
}

export function pronunciationRequestReducer(
  state: PronunciationRequestState,
  action: PronunciationRequestAction,
): PronunciationRequestState {
  switch (action.type) {
    case REQUEST_ACTION.start:
      return { status: REQUEST_STATUS.loading, word: action.word };
    case REQUEST_ACTION.succeed:
      return isStale(state, action.word)
        ? state
        : { status: REQUEST_STATUS.ready, word: action.word, result: action.result };
    case REQUEST_ACTION.fail:
      return isStale(state, action.word)
        ? state
        : { status: REQUEST_STATUS.failed, word: action.word, error: action.error };
    case REQUEST_ACTION.reset:
      return INITIAL_REQUEST_STATE;
  }
}
