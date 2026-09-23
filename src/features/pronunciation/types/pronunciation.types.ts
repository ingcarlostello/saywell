import type { Lang } from '@/shared/types/i18n.types';
import type { BadgeVariant } from '@/shared/ui';
import type {
  COUNTER_TONE,
  PRONUNCIATION_ERROR,
  REQUEST_ACTION,
  REQUEST_STATUS,
  RESULT_STATUS,
  RESULT_VIEW,
} from '../constants/pronunciation.constants';
import type { RateLimitSnapshot, RateLimitView } from './rateLimit.types';

export type { PronounceRequestDto, PronunciationResultDto } from '../schemas/pronunciation.schema';

// ── Domain model ─────────────────────────────────────────────────────────────────────────────────────────

export interface PronunciationPart {
  id: string;
  syllable: string;
  stressed: boolean;
  explanation: string;
}

// Out of scope carries the word too: a result always knows which query produced it.
export type PronunciationResult =
  | {
      status: typeof RESULT_STATUS.ok;
      word: string;
      phonetic: string;
      parts: readonly PronunciationPart[];
      example: string;
    }
  | { status: typeof RESULT_STATUS.outOfScope; word: string };

// `clientId` identifies the device for the rate limit; it travels as a header, not in the body.
export interface PronunciationInput {
  word: string;
  lang: Lang;
  clientId: string;
}

export interface PronunciationResponse {
  result: PronunciationResult;
  rateLimit: RateLimitSnapshot;
}

export type PronunciationErrorKind = (typeof PRONUNCIATION_ERROR)[keyof typeof PRONUNCIATION_ERROR];

// ── Request state (the `useReducer` of the facade's internal hook, per the override of CLAUDE.md §2) ─────

export type PronunciationRequestState =
  | { status: typeof REQUEST_STATUS.idle }
  | { status: typeof REQUEST_STATUS.loading; word: string }
  | { status: typeof REQUEST_STATUS.ready; word: string; result: PronunciationResult }
  | { status: typeof REQUEST_STATUS.failed; word: string; error: PronunciationErrorKind };

export type PronunciationRequestAction =
  | { type: typeof REQUEST_ACTION.start; word: string }
  | { type: typeof REQUEST_ACTION.succeed; word: string; result: PronunciationResult }
  | { type: typeof REQUEST_ACTION.fail; word: string; error: PronunciationErrorKind }
  | { type: typeof REQUEST_ACTION.reset };

// ── UI texts and facade contract ─────────────────────────────────────────────────────────────────────────

export type CounterTone = (typeof COUNTER_TONE)[keyof typeof COUNTER_TONE];

export interface PronunciationTexts {
  placeholder: string;
  clear: string;
  submit: string;
  loading: string;
  partsHeading: string;
  stressed: string;
  outOfScope: string;
  retry: string;
  errors: Readonly<Record<PronunciationErrorKind, string>>;
}

export interface SyllableView {
  id: string;
  label: string;
  explanation: string;
  isStressed: boolean;
  variant: BadgeVariant;
}

export interface WordFieldView {
  value: string;
  placeholder: string;
  maxLength: number;
  counterLabel: string;
  counterTone: CounterTone;
  clearLabel: string;
  canClear: boolean;
  onValueChange: (value: string) => void;
  onClear: () => void;
}

export interface PronounceButtonView {
  label: string;
  isLoading: boolean;
  isDisabled: boolean;
  onSubmit: () => void;
}

export interface PronunciationReadyView {
  kind: typeof RESULT_VIEW.ready;
  word: string;
  phonetic: string;
  partsHeading: string;
  stressedLabel: string;
  syllables: readonly SyllableView[];
  example: string;
}

export type PronunciationResultView =
  | { kind: typeof RESULT_VIEW.empty }
  | { kind: typeof RESULT_VIEW.loading; label: string }
  | PronunciationReadyView
  | { kind: typeof RESULT_VIEW.outOfScope; message: string }
  | { kind: typeof RESULT_VIEW.error; message: string; retryLabel: string; onRetry: () => void };

// `rateLimit` is absent until the first answer: the quota is only known from a response.
export interface PronunciationFacade {
  field: WordFieldView;
  pronounce: PronounceButtonView;
  result: PronunciationResultView;
  rateLimit?: RateLimitView;
}
