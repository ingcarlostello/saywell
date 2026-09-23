import type { RateLimitSnapshot } from '../types/rateLimit.types';

// Explicit `undefined` rather than optional keys: `reset()` merges `initialState`, and a missing key would
// leave the old value in place.
export interface RateLimitState {
  clientId: string | undefined;
  snapshot: RateLimitSnapshot | undefined;
}

export interface RateLimitStore extends RateLimitState {
  setClientId: (clientId: string) => void;
  setSnapshot: (snapshot: RateLimitSnapshot) => void;
  clearSnapshot: () => void;
  reset: () => void;
}
