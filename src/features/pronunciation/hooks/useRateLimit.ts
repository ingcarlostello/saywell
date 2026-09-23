import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStorageSync } from '@/shared/hooks/useStorageSync';
import { RATE_LIMIT_PERSIST, RATE_LIMIT_TEXTS, RATE_LIMIT_TONE } from '../constants/rateLimit.constants';
import {
  getRateLimitStatus,
  isImpossibleSnapshot,
  mergeSnapshot,
  toExhaustedSnapshot,
  toRateLimitView,
  toSupportedClientId,
  toSupportedSnapshot,
} from '../helpers/rateLimit.helper';
import { useRateLimitStore } from '../store/rateLimitStore';
import type { RateLimitController, RateLimitSnapshot, UseRateLimitOptions } from '../types/rateLimit.types';

export function useRateLimit({ now, lang }: UseRateLimitOptions): RateLimitController {
  const { storedSnapshot, setClientId, setSnapshot, clearSnapshot } = useRateLimitStore(
    useShallow((s) => ({
      storedSnapshot: s.snapshot,
      setClientId: s.setClientId,
      setSnapshot: s.setSnapshot,
      clearSnapshot: s.clearSnapshot,
    })),
  );
  useStorageSync(RATE_LIMIT_PERSIST.key, useRateLimitStore);
  const snapshot = toSupportedSnapshot(storedSnapshot);
  const status = getRateLimitStatus(snapshot, now);
  const isImpossible = isImpossibleSnapshot(snapshot, now);

  // Deleted, not just ignored: an impossible window would block again once the wrong clock caught up. A refused
  // localStorage write must not throw out of the effect (it would unmount the app): memory is already cleared.
  useEffect(() => {
    if (!isImpossible) return;
    try {
      clearSnapshot();
    } catch (error) {
      reportError(error);
    }
  }, [isImpossible, clearSnapshot]);

  // Called from the submit handler, never during render: the first question of a device creates its id.
  // Read at call time, so two tabs converge on the id the other one may have just written.
  const ensureClientId = (): string => {
    const clientId = toSupportedClientId(useRateLimitStore.getState().clientId);
    if (clientId) return clientId;
    const created = crypto.randomUUID();
    // Persisting it is best effort: zustand keeps it in memory even when localStorage refuses the write.
    try {
      setClientId(created);
    } catch (error) {
      reportError(error);
    }
    return created;
  };
  // The previous snapshot, the clock and the limit are read when the answer arrives, not at the last render.
  const readStored = (): RateLimitSnapshot | undefined => toSupportedSnapshot(useRateLimitStore.getState().snapshot);

  return {
    status,
    isBlocked: status.tone === RATE_LIMIT_TONE.blocked,
    view: toRateLimitView(status, lang, RATE_LIMIT_TEXTS[lang]),
    ensureClientId,
    record: (next) => setSnapshot(mergeSnapshot(readStored(), next)),
    markExhausted: (retryAfterMs) => setSnapshot(toExhaustedSnapshot(readStored(), retryAfterMs, Date.now())),
  };
}
