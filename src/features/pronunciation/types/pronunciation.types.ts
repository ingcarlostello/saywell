import type { LANG_TAGS } from '@/shared/constants/i18n.constants';
import type { Lang } from '@/shared/types/i18n.types';
import type { BadgeVariant } from '@/shared/ui';
import type {
  COUNTER_TONE,
  FAILURE_KIND,
  FAILURE_REASON,
  NOTICE_TONE,
  REQUEST_ACTION,
  REQUEST_STATUS,
  RESULT_STATUS,
  RESULT_VIEW,
} from '../constants/pronunciation.constants';
import type { HistoryView } from './history.types';
import type { RateLimitSnapshot, RateLimitStatus, RateLimitView } from './rateLimit.types';

export type { PronounceRequestDto, PronunciationResultDto } from '../schemas/pronunciation.schema';

// ── Domain model ─────────────────────────────────────────────────────────────────────────────────────────

export interface PronunciationPart {
  id: string;
  syllable: string;
  stressed: boolean;
  explanation: string;
}

export interface PronouncedResult {
  status: typeof RESULT_STATUS.ok;
  word: string;
  phonetic: string;
  parts: readonly PronunciationPart[];
  example: string;
}

// Out of scope carries the word too: a result always knows which query produced it.
export interface OutOfScopeResult {
  status: typeof RESULT_STATUS.outOfScope;
  word: string;
}

export type PronunciationResult = PronouncedResult | OutOfScopeResult;

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

export type FailureReason = (typeof FAILURE_REASON)[keyof typeof FAILURE_REASON];

export type PronunciationFailure =
  | { kind: typeof FAILURE_KIND.aborted }
  | { kind: typeof FAILURE_KIND.outOfScope }
  | { kind: typeof FAILURE_KIND.rateLimited; retryAfterMs?: number }
  | { kind: typeof FAILURE_KIND.failed; reason: FailureReason };

// What the reducer keeps: an abort has nothing to show.
export type ShownFailure = Exclude<PronunciationFailure, { kind: typeof FAILURE_KIND.aborted }>;

// ── Request state (the `useReducer` of usePronunciationRequest, per the override of CLAUDE.md §2) ────────

// `lang` is the language the explanations were asked in: switching the UI language afterwards does not
// re-ask (it would spend quota), so the card keeps rendering in the language of its content. `rateLimit` is
// the quota that came with the answer, frozen: it is what the announcement says, whatever happens later.
export type PronunciationRequestState =
  | { status: typeof REQUEST_STATUS.idle }
  | { status: typeof REQUEST_STATUS.loading; word: string; lang: Lang }
  | {
      status: typeof REQUEST_STATUS.ready;
      word: string;
      lang: Lang;
      result: PronunciationResult;
      rateLimit: RateLimitSnapshot;
    }
  | { status: typeof REQUEST_STATUS.failed; word: string; failure: ShownFailure };

export type LoadingRequestState = Extract<PronunciationRequestState, { status: typeof REQUEST_STATUS.loading }>;

// `cancel` ends a request aborted by an effect cleanup while the view is still mounted (Fast Refresh):
// nothing failed, so it goes back to idle instead of showing a notice.
export type PronunciationRequestAction =
  | { type: typeof REQUEST_ACTION.start; word: string; lang: Lang }
  | { type: typeof REQUEST_ACTION.succeed; word: string; result: PronunciationResult; rateLimit: RateLimitSnapshot }
  | { type: typeof REQUEST_ACTION.fail; word: string; failure: ShownFailure }
  | { type: typeof REQUEST_ACTION.cancel; word: string };

// ── Texts ────────────────────────────────────────────────────────────────────────────────────────────────

export interface HeroTexts {
  title: { before: string; highlight: string; after: string };
  subtitle: string;
  note: string;
}

export interface FormTexts {
  field: string;
  placeholder: string;
  clear: string;
  counter: string;
  submit: string;
  submitBlocked: string;
}

// Announcements carry no content of the answer (neither the English word nor the phonetic, which is spelled
// for the language it was asked in): the LiveRegion speaks in the UI language, and a Spanish voice reading
// "delivered" would teach the wrong pronunciation. The card holds that content, tagged with its `lang`.
export interface ResultTexts {
  idleTitle: string;
  idleMessage: string;
  partsTitle: string;
  stressed: string;
  listen: string;
  retry: string;
  announceLoading: string;
  announceReady: string;
  announceNotice: string;
  announceWithQuota: string;
}

export interface NoticeTexts {
  title: string;
  message: string;
}

export interface PronunciationTexts {
  hero: HeroTexts;
  form: FormTexts;
  result: ResultTexts;
  notices: {
    outOfScope: NoticeTexts;
    rateLimited: NoticeTexts;
    rateLimitOver: NoticeTexts;
    failed: Readonly<Record<FailureReason, NoticeTexts>>;
  };
}

// ── Views (facade → container) ───────────────────────────────────────────────────────────────────────────

export type CounterTone = (typeof COUNTER_TONE)[keyof typeof COUNTER_TONE];

export type NoticeTone = (typeof NOTICE_TONE)[keyof typeof NOTICE_TONE];

export type LangTag = (typeof LANG_TAGS)[Lang];

// `text` is the visual "8 / 50"; `description` is what aria-describedby reads ("8 de 50 caracteres").
export interface CounterView {
  text: string;
  description: string;
  tone: CounterTone;
}

export interface FormLabels {
  field: string;
  placeholder: string;
  clear: string;
}

export interface PronunciationFormView {
  value: string;
  maxLength: number;
  counter: CounterView;
  submitLabel: string;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  canClear: boolean;
  focusRequestId: number;
  // Bumped by retry: the notice holding the focused Retry button unmounts, so the focus moves to the submit
  // button, which stays mounted (and busy) next to the answer on its way.
  submitFocusRequestId: number;
  labels: FormLabels;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export interface SyllableView {
  id: string;
  label: string;
  explanation: string;
  isStressed: boolean;
  variant: BadgeVariant;
}

// `lang` marks the explanations (the language they were asked in); `wordLang` the English word and example.
export interface ResultCardView {
  lang: LangTag;
  wordLang: LangTag;
  word: string;
  phonetic: string;
  partsTitle: string;
  stressedLabel: string;
  syllables: readonly SyllableView[];
  example: string;
}

// UI chrome, like retry: its label follows the UI language, so the component renders it outside the card's
// `lang` region.
export interface ListenView {
  label: string;
  onListen: () => void;
}

export interface RetryView {
  label: string;
  onRetry: () => void;
}

export interface NoticeView {
  kind: typeof RESULT_VIEW.notice;
  tone: NoticeTone;
  title: string;
  message: string;
  retry?: RetryView;
}

export type PronunciationResultView =
  | { kind: typeof RESULT_VIEW.idle; labels: NoticeTexts }
  | { kind: typeof RESULT_VIEW.loading }
  | { kind: typeof RESULT_VIEW.ready; card: ResultCardView; listen?: ListenView }
  | NoticeView;

// The facade picks every text by language (CLAUDE.md): `texts` in the UI language, `cardTexts` in the
// language the answer was asked in. `listen` and `onRetry` are closures it builds; the helper only places them.
export interface ResultViewContext {
  texts: PronunciationTexts;
  cardTexts: ResultTexts;
  rateLimit: RateLimitStatus;
  listen: ListenView | undefined;
  onRetry: () => void;
}

export interface PronunciationFacade {
  hero: HeroTexts;
  form: PronunciationFormView;
  result: PronunciationResultView;
  rateLimit: RateLimitView;
  history: HistoryView;
  announcement: string;
}

// ── Internal hooks of the facade ─────────────────────────────────────────────────────────────────────────

export interface FocusRequestController {
  id: number;
  request: () => void;
}

export interface PronunciationInputController {
  value: string;
  focusRequestId: number;
  setValue: (value: string) => void;
  clear: () => void;
  fill: (word: string) => void;
}

// Collaborators the request needs from its siblings (rate limit, history), passed per call.
export interface PronunciationSend {
  word: string;
  lang: Lang;
  getClientId: () => string;
  saveAnswer: (response: PronunciationResponse) => void;
  saveRateLimited: (retryAfterMs: number | undefined) => void;
}

export interface PronunciationRequestController {
  state: PronunciationRequestState;
  send: (request: PronunciationSend) => Promise<void>;
}
