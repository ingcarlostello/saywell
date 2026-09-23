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

export interface RateLimitTexts {
  remaining: string;
  exhausted: string;
  hint: string;
}

export interface RateLimitView {
  label: string;
  hint: string;
  isExhausted: boolean;
}
