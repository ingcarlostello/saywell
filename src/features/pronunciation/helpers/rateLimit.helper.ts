import { ApiError } from '@/shared/api/ApiError';
import { MS_PER_MINUTE } from '../constants/rateLimit.constants';
import type { RateLimitSnapshot } from '../types/rateLimit.types';

// The snapshot is cached between requests, so it outlives its own window: past `resetAt` its numbers
// describe an hour that already ended.
export function isRateLimitSnapshotExpired(snapshot: RateLimitSnapshot, now: number): boolean {
  return snapshot.resetAt <= now;
}

// Exhausted only while the window is still open. Past it the quota is free again, but *how much* is free
// is not knowable from the snapshot: the server caps by device and by IP, two windows that expire apart,
// and `remaining` is the smaller of the two. An expired snapshot answers "not exhausted" and nothing else.
export function isRateLimitExhausted(snapshot: RateLimitSnapshot, now: number): boolean {
  return snapshot.remaining <= 0 && !isRateLimitSnapshotExpired(snapshot, now);
}

// Rounded up and never below 1: "espera 0 min" would read as "you can ask now".
export function toMinutesLeft(ms: number): number {
  return Math.max(1, Math.ceil(ms / MS_PER_MINUTE));
}

export function toMinutesUntilReset(snapshot: RateLimitSnapshot, now: number): number {
  return toMinutesLeft(snapshot.resetAt - now);
}

// A 429 can arrive with no snapshot cached at all — the first query of a device is already subject to the
// IP ceiling — and `apiClient` throws before reading the error body, so the `rateLimit` the server puts
// there never reaches us. `Retry-After`, which it does parse, is then the only thing that says how long
// to wait.
export function toRetryAfterMs(error: unknown): number | undefined {
  return error instanceof ApiError ? error.retryAfterMs : undefined;
}
