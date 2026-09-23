import type { Lang } from '@/shared/types/i18n.types';
import type { RATE_LIMIT_TONE } from '../constants/rateLimit.constants';

export type { RateLimitSnapshotDto } from '../schemas/rateLimit.schema';

// The server sends a duration (`resetInMs`); the snapshot is cached between requests, so the model holds
// the absolute instant the window ends, in epoch milliseconds.
export interface RateLimitSnapshot {
  limit: number;
  remaining: number;
  resetAt: number;
}

// §9.4: the adapter never reads the clock on its own; `now` is epoch milliseconds.
export interface RateLimitDeps {
  now: number;
}

export type RateLimitTone = (typeof RATE_LIMIT_TONE)[keyof typeof RATE_LIMIT_TONE];

// What the quota allows right now, derived from the cached snapshot and the clock.
export type RateLimitStatus =
  | { tone: typeof RATE_LIMIT_TONE.default | typeof RATE_LIMIT_TONE.warning; limit: number; remaining: number }
  | { tone: typeof RATE_LIMIT_TONE.blocked; limit: number; minutesLeft: number };

export interface PluralTexts {
  one: string;
  other: string;
}

export interface RateLimitTexts {
  remaining: PluralTexts;
  exhausted: string;
  infoLabel: string;
  infoText: string;
}

export interface RateLimitView {
  tone: RateLimitTone;
  message: string;
  infoLabel: string;
  infoText: string;
}

export interface UseRateLimitOptions {
  now: number;
  lang: Lang;
}

// Internal to the facade: `ensureClientId` runs inside the submit handler, never during render.
export interface RateLimitController {
  status: RateLimitStatus;
  isBlocked: boolean;
  view: RateLimitView;
  ensureClientId: () => string;
  record: (snapshot: RateLimitSnapshot) => void;
  markExhausted: (retryAfterMs: number | undefined) => void;
}
