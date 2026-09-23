import type { RateLimitDeps, RateLimitSnapshot, RateLimitSnapshotDto } from '../types/rateLimit.types';

// Duration → instant: the snapshot survives in the store after the response, so a relative `resetInMs`
// would age silently. The clock arrives through `deps` (§9.4), never read inside the adapter.
export function toRateLimitSnapshot(dto: RateLimitSnapshotDto, deps: RateLimitDeps): RateLimitSnapshot {
  return { limit: dto.limit, remaining: dto.remaining, resetAt: deps.now + dto.resetInMs };
}
