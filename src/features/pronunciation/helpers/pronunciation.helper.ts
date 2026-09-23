import { API_ERROR_KIND } from '@/shared/api/api.constants';
import { ApiError } from '@/shared/api/ApiError';
import { LANG_TAGS } from '@/shared/constants/i18n.constants';
import type { Lang } from '@/shared/types/i18n.types';
import type { BadgeVariant } from '@/shared/ui';
import { interpolate } from '@/shared/utils/i18n.utils';
import {
  COUNTER_LABEL_TEMPLATE,
  COUNTER_TONE,
  FAILURE_KIND,
  FAILURE_REASON,
  INITIAL_REQUEST_STATE,
  INPUT_LIMITS,
  NOTICE_TONE,
  REQUEST_ACTION,
  REQUEST_STATUS,
  RESULT_STATUS,
  RESULT_VIEW,
  STRESSED_SYLLABLE_VARIANT,
  TRAILING_HIGH_SURROGATE_PATTERN,
  UNSTRESSED_SYLLABLE_VARIANTS,
  WHITESPACE_RUN_PATTERN,
} from '../constants/pronunciation.constants';
import { RATE_LIMIT_TONE } from '../constants/rateLimit.constants';
import type {
  CounterTone,
  CounterView,
  FailureReason,
  FormTexts,
  LoadingRequestState,
  NoticeTexts,
  NoticeTone,
  NoticeView,
  PronouncedResult,
  PronunciationFailure,
  PronunciationPart,
  PronunciationRequestAction,
  PronunciationRequestState,
  PronunciationResultView,
  ResultCardView,
  ResultTexts,
  ResultViewContext,
  ShownFailure,
  SyllableView,
} from '../types/pronunciation.types';
import type { RateLimitStatus } from '../types/rateLimit.types';

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
export function canSubmitWord(value: string): boolean {
  return normalizeWord(value).length > 0;
}

export function toCounterView(length: number, texts: FormTexts): CounterView {
  const values = { length, max: INPUT_LIMITS.maxLength };
  return {
    text: interpolate(COUNTER_LABEL_TEMPLATE, values),
    description: interpolate(texts.counter, values),
    tone: getCounterTone(length),
  };
}

function getCounterTone(length: number): CounterTone {
  if (length >= INPUT_LIMITS.maxLength) return COUNTER_TONE.danger;
  if (length >= INPUT_LIMITS.warningLength) return COUNTER_TONE.warning;
  return COUNTER_TONE.normal;
}

export function toSubmitLabel(rateLimit: RateLimitStatus, texts: FormTexts): string {
  return rateLimit.tone === RATE_LIMIT_TONE.blocked
    ? interpolate(texts.submitBlocked, { minutes: rateLimit.minutesLeft })
    : texts.submit;
}

// ── Request lifecycle ────────────────────────────────────────────────────────────────────────────────────

// An abort is the UI replacing its own question. The 422 prefilter (emojis, other scripts) reads as out of
// scope, like the LLM's refusal; anything unmodelled reads as a server failure.
export function toPronunciationFailure(error: unknown): PronunciationFailure {
  if (!(error instanceof ApiError)) return failed(FAILURE_REASON.server);
  switch (error.kind) {
    case API_ERROR_KIND.aborted:
      return { kind: FAILURE_KIND.aborted };
    case API_ERROR_KIND.unprocessable:
      return { kind: FAILURE_KIND.outOfScope };
    case API_ERROR_KIND.rateLimited:
      return { kind: FAILURE_KIND.rateLimited, retryAfterMs: error.retryAfterMs };
    case API_ERROR_KIND.network:
      return failed(FAILURE_REASON.network);
    case API_ERROR_KIND.timeout:
      return failed(FAILURE_REASON.timeout);
    default:
      return failed(FAILURE_REASON.server);
  }
}

const failed = (reason: FailureReason): PronunciationFailure => ({ kind: FAILURE_KIND.failed, reason });

// Only the request still in flight may finish: a late answer for another word is dropped.
function isInFlight(state: PronunciationRequestState, word: string): state is LoadingRequestState {
  return state.status === REQUEST_STATUS.loading && state.word === word;
}

export function pronunciationRequestReducer(
  state: PronunciationRequestState,
  action: PronunciationRequestAction,
): PronunciationRequestState {
  switch (action.type) {
    case REQUEST_ACTION.start:
      return { status: REQUEST_STATUS.loading, word: action.word, lang: action.lang };
    case REQUEST_ACTION.succeed:
      if (!isInFlight(state, action.word)) return state;
      return { status: REQUEST_STATUS.ready, word: action.word, lang: state.lang, result: action.result };
    case REQUEST_ACTION.fail:
      if (!isInFlight(state, action.word)) return state;
      return { status: REQUEST_STATUS.failed, word: action.word, failure: action.failure };
    case REQUEST_ACTION.cancel:
      return isInFlight(state, action.word) ? INITIAL_REQUEST_STATE : state;
  }
}

// The word of the last question, whatever became of it: retry resends it and the history highlights it.
export function toLastWord(state: PronunciationRequestState): string | undefined {
  return state.status === REQUEST_STATUS.idle ? undefined : state.word;
}

// The language the shown answer was asked in; `undefined` when there is no answer to render.
export function toContentLang(state: PronunciationRequestState): Lang | undefined {
  return state.status === REQUEST_STATUS.loading || state.status === REQUEST_STATUS.ready ? state.lang : undefined;
}

// ── Result area ──────────────────────────────────────────────────────────────────────────────────────────

export function toResultView(state: PronunciationRequestState, context: ResultViewContext): PronunciationResultView {
  const { result, notices } = context.texts;
  switch (state.status) {
    case REQUEST_STATUS.idle:
      return { kind: RESULT_VIEW.idle, labels: { title: result.idleTitle, message: result.idleMessage } };
    case REQUEST_STATUS.loading:
      return { kind: RESULT_VIEW.loading };
    case REQUEST_STATUS.ready:
      return state.result.status === RESULT_STATUS.ok
        ? {
            kind: RESULT_VIEW.ready,
            card: toResultCard(state.result, state.lang, context.cardTexts),
            listen: context.listen,
          }
        : toNotice(NOTICE_TONE.info, notices.outOfScope);
    case REQUEST_STATUS.failed:
      return toFailureNotice(state.failure, context);
  }
}

// Retry is offered only when it can work: never for out of scope, never while the quota is spent. A 429
// notice turns into "you can ask again" once the window reopens.
function toFailureNotice(failure: ShownFailure, context: ResultViewContext): PronunciationResultView {
  const { notices, result } = context.texts;
  const { rateLimit } = context;
  const retry = { label: result.retry, onRetry: context.onRetry };
  switch (failure.kind) {
    case FAILURE_KIND.outOfScope:
      return toNotice(NOTICE_TONE.info, notices.outOfScope);
    case FAILURE_KIND.rateLimited:
      return rateLimit.tone === RATE_LIMIT_TONE.blocked
        ? toNotice(NOTICE_TONE.warning, notices.rateLimited, { limit: rateLimit.limit, minutes: rateLimit.minutesLeft })
        : { ...toNotice(NOTICE_TONE.info, notices.rateLimitOver), retry };
    case FAILURE_KIND.failed: {
      const notice = toNotice(NOTICE_TONE.error, notices.failed[failure.reason]);
      return rateLimit.tone === RATE_LIMIT_TONE.blocked ? notice : { ...notice, retry };
    }
  }
}

function toNotice(
  tone: NoticeTone,
  texts: NoticeTexts,
  values: Readonly<Record<string, string | number>> = {},
): NoticeView {
  return { kind: RESULT_VIEW.notice, tone, title: texts.title, message: interpolate(texts.message, values) };
}

// The card speaks the language its explanations were asked in, not the UI's current one; `texts` arrive
// already picked for that language.
function toResultCard(answer: PronouncedResult, lang: Lang, texts: ResultTexts): ResultCardView {
  return {
    lang: LANG_TAGS[lang],
    wordLang: LANG_TAGS.en,
    word: answer.word,
    phonetic: answer.phonetic,
    partsTitle: texts.partsTitle,
    stressedLabel: texts.stressed,
    syllables: toSyllableViews(answer.parts),
    example: answer.example,
  };
}

function toSyllableViews(parts: readonly PronunciationPart[]): SyllableView[] {
  return parts.map((part, index) => ({
    id: part.id,
    label: part.syllable,
    explanation: part.explanation,
    isStressed: part.stressed,
    variant: part.stressed ? STRESSED_SYLLABLE_VARIANT : toUnstressedVariant(countUnstressed(parts.slice(0, index))),
  }));
}

const countUnstressed = (parts: readonly PronunciationPart[]): number => parts.filter((part) => !part.stressed).length;

// The modulo is always in range; the fallback only satisfies noUncheckedIndexedAccess.
function toUnstressedVariant(position: number): BadgeVariant {
  return UNSTRESSED_SYLLABLE_VARIANTS[position % UNSTRESSED_SYLLABLE_VARIANTS.length] ?? UNSTRESSED_SYLLABLE_VARIANTS[0];
}

// What the single LiveRegion reads. The 429 notice (the only warning) announces its title alone: its message
// carries a countdown that would be re-read on every tick.
export function toAnnouncement(view: PronunciationResultView, texts: ResultTexts): string {
  switch (view.kind) {
    case RESULT_VIEW.idle:
      return '';
    case RESULT_VIEW.loading:
      return texts.announceLoading;
    case RESULT_VIEW.ready:
      return texts.announceReady;
    case RESULT_VIEW.notice:
      return view.tone === NOTICE_TONE.warning
        ? view.title
        : interpolate(texts.announceNotice, { title: view.title, message: view.message });
  }
}
