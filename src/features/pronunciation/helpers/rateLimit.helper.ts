import { LANG_TAGS } from '@/shared/constants/i18n.constants';
import type { Lang } from '@/shared/types/i18n.types';
import { interpolate } from '@/shared/utils/i18n.utils';
import {
  MS_PER_MINUTE,
  PLURAL_ONE,
  RATE_LIMIT_CLOCK_TOLERANCE_MS,
  RATE_LIMIT_DEFAULTS,
  RATE_LIMIT_LOW_THRESHOLD,
  RATE_LIMIT_TONE,
  UUID_V4_PATTERN,
} from '../constants/rateLimit.constants';
import type {
  PluralTexts,
  RateLimitSnapshot,
  RateLimitStatus,
  RateLimitTexts,
  RateLimitView,
} from '../types/rateLimit.types';

// ── Persisted values arrive unvalidated (§12.6 #4); the store never validates ───────────────────────────

const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0;

export function toSupportedSnapshot(value: unknown): RateLimitSnapshot | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  if (!('limit' in value) || !('remaining' in value) || !('resetAt' in value)) return undefined;
  const { limit, remaining, resetAt } = value;
  // The server computes remaining = min(device, IP) and never more than the device limit it reports.
  if (!isCount(limit) || limit === 0 || !isCount(remaining) || remaining > limit) return undefined;
  if (typeof resetAt !== 'number' || !Number.isFinite(resetAt)) return undefined;
  return { limit, remaining, resetAt };
}

export function toSupportedClientId(value: unknown): string | undefined {
  return typeof value === 'string' && UUID_V4_PATTERN.test(value) ? value : undefined;
}

// ── Quota ────────────────────────────────────────────────────────────────────────────────────────────────

// A window ending further out than one full window can only come from a clock that jumped back after the
// snapshot was anchored. Trusting it would block the button for hours, and while blocked no request goes
// out that could correct it; the caller also deletes it, or it would block again once the wrong clock
// caught up.
export function isImpossibleSnapshot(snapshot: RateLimitSnapshot | undefined, now: number): boolean {
  return snapshot !== undefined && snapshot.resetAt - now > RATE_LIMIT_DEFAULTS.windowMs + RATE_LIMIT_CLOCK_TOLERANCE_MS;
}

// Before the first answer, and once the window has ended, the quota counts as full. The server caps by
// device and by IP with windows that can expire apart, so that is exact for one person per IP and
// optimistic behind a shared IP: the next answer (or 429) corrects it.
export function getRateLimitStatus(snapshot: RateLimitSnapshot | undefined, now: number): RateLimitStatus {
  const limit = snapshot?.limit ?? RATE_LIMIT_DEFAULTS.limit;
  if (!snapshot || snapshot.resetAt <= now || isImpossibleSnapshot(snapshot, now)) {
    return { tone: RATE_LIMIT_TONE.default, limit, remaining: limit };
  }
  if (snapshot.remaining === 0) {
    // `now` can trail the clock that anchored `resetAt` by one tick: never count past a whole window.
    const msLeft = Math.min(snapshot.resetAt - now, RATE_LIMIT_DEFAULTS.windowMs);
    return { tone: RATE_LIMIT_TONE.blocked, limit, minutesLeft: toMinutesLeft(msLeft) };
  }
  const tone = snapshot.remaining <= RATE_LIMIT_LOW_THRESHOLD ? RATE_LIMIT_TONE.warning : RATE_LIMIT_TONE.default;
  return { tone, limit, remaining: snapshot.remaining };
}

// Two answers of the same window can land out of order (another tab, a slow model call): the server
// consumes before it calls the model. Within one window `remaining` only goes down, so the lower count is
// the newer truth. Same window = same limit and `resetAt` within the tolerance (they differ by latency only).
export function mergeSnapshot(previous: RateLimitSnapshot | undefined, next: RateLimitSnapshot): RateLimitSnapshot {
  const isSameWindow =
    previous !== undefined &&
    previous.limit === next.limit &&
    Math.abs(previous.resetAt - next.resetAt) <= RATE_LIMIT_CLOCK_TOLERANCE_MS;
  return isSameWindow ? { ...next, remaining: Math.min(previous.remaining, next.remaining) } : next;
}

// A 429 reaches the client without its body (`apiClient` decides on status and headers only), so the spent
// window is rebuilt from Retry-After, keeping the limit already known. Capped at one window: a 429 from a
// proxy in front of Vercel may ask for longer than our server ever would.
export function toExhaustedSnapshot(
  previous: RateLimitSnapshot | undefined,
  retryAfterMs: number | undefined,
  now: number,
): RateLimitSnapshot {
  return {
    limit: previous?.limit ?? RATE_LIMIT_DEFAULTS.limit,
    remaining: 0,
    resetAt: now + Math.min(retryAfterMs ?? RATE_LIMIT_DEFAULTS.windowMs, RATE_LIMIT_DEFAULTS.windowMs),
  };
}

export function toRateLimitView(status: RateLimitStatus, lang: Lang, texts: RateLimitTexts): RateLimitView {
  const message =
    status.tone === RATE_LIMIT_TONE.blocked
      ? interpolate(texts.exhausted, { minutes: status.minutesLeft })
      : interpolate(selectPlural(texts.remaining, status.remaining, lang), {
          remaining: status.remaining,
          limit: status.limit,
        });
  return {
    tone: status.tone,
    message,
    infoLabel: texts.infoLabel,
    infoText: interpolate(texts.infoText, { limit: status.limit }),
  };
}

// What the LiveRegion adds to an answer about the quota that answer reported (WCAG 4.1.3): nothing while
// plenty is left, the count once it runs low, and a plain "none left" at 0. It reads the snapshot of that
// answer, never the clock, so no tick, other tab or expired window changes a sentence already announced.
export function toQuotaAnnouncement(snapshot: RateLimitSnapshot, lang: Lang, texts: RateLimitTexts): string | undefined {
  if (snapshot.remaining === 0) return texts.announceSpent;
  if (snapshot.remaining > RATE_LIMIT_LOW_THRESHOLD) return undefined;
  return interpolate(selectPlural(texts.remaining, snapshot.remaining, lang), {
    remaining: snapshot.remaining,
    limit: snapshot.limit,
  });
}

// Rounded up and never below 1: "espera 0 min" would read as "you can ask now".
function toMinutesLeft(ms: number): number {
  return Math.max(1, Math.ceil(ms / MS_PER_MINUTE));
}

function selectPlural(texts: PluralTexts, count: number, lang: Lang): string {
  return new Intl.PluralRules(LANG_TAGS[lang]).select(count) === PLURAL_ONE ? texts.one : texts.other;
}
