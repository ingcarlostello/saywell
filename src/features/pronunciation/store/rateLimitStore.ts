import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { RATE_LIMIT_PERSIST } from '../constants/rateLimit.constants';
import type { RateLimitState, RateLimitStore } from './rateLimitStore.types';

const initialState: RateLimitState = { clientId: undefined, snapshot: undefined };

// The snapshot is a cache of what the server answered (CLAUDE.md override 3); the device id is a random
// UUID, not a credential, so persisting it is fine (§8.3 forbids persisting tokens).
export const useRateLimitStore = create<RateLimitStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        setClientId: (clientId) => set({ clientId }, false, 'rateLimit/setClientId'),
        setSnapshot: (snapshot) => set({ snapshot }, false, 'rateLimit/setSnapshot'),
        clearSnapshot: () => set({ snapshot: undefined }, false, 'rateLimit/clearSnapshot'),
        reset: () => set(initialState, false, 'rateLimit/reset'),
      }),
      {
        name: RATE_LIMIT_PERSIST.key,
        version: RATE_LIMIT_PERSIST.version,
        storage: createJSONStorage(() => localStorage),
        partialize: ({ clientId, snapshot }) => ({ clientId, snapshot }),
      },
    ),
    { name: 'rateLimit', enabled: import.meta.env.DEV },
  ),
);
