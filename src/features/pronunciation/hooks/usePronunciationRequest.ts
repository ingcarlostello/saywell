import { useEffect, useReducer, useRef } from 'react';
import { FAILURE_KIND, INITIAL_REQUEST_STATE, REQUEST_ACTION } from '../constants/pronunciation.constants';
import { pronunciationRequestReducer, toPronunciationFailure } from '../helpers/pronunciation.helper';
import { requestPronunciation } from '../services/pronunciation.services';
import type { PronunciationRequestController, PronunciationSend } from '../types/pronunciation.types';

// Persisting is best effort: zustand updates memory before localStorage can refuse the write (quota full,
// storage disabled), so the screen is already right. The error is reported, never swallowed, and never takes
// the request down with it (nor becomes an unhandled rejection of the `void`ed send).
function saveSafely(save: () => void): void {
  try {
    save();
  } catch (error) {
    reportError(error);
  }
}

// One question in flight at a time: a new one aborts the previous, and leaving the view aborts the last.
export function usePronunciationRequest(): PronunciationRequestController {
  const [state, dispatch] = useReducer(pronunciationRequestReducer, INITIAL_REQUEST_STATE);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const send = async ({ word, lang, getClientId, saveAnswer, saveRateLimited }: PronunciationSend): Promise<void> => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    dispatch({ type: REQUEST_ACTION.start, word, lang });
    try {
      // Inside the try: without crypto.randomUUID (plain http over LAN) the id fails, and that is a failure
      // to show, not an unhandled rejection.
      const clientId = getClientId();
      const response = await requestPronunciation({ word, lang, clientId }, { signal: controller.signal });
      // Shown before it is saved, on both paths: a storage error must not hide an answer or lock the form.
      dispatch({ type: REQUEST_ACTION.succeed, word, result: response.result, rateLimit: response.rateLimit });
      saveSafely(() => saveAnswer(response));
    } catch (error) {
      const failure = toPronunciationFailure(error);
      if (failure.kind === FAILURE_KIND.aborted) {
        // A newer send owns the state now. If this is still the current request, an effect cleanup aborted
        // it while the view stays mounted (Fast Refresh): leaving `loading` would lock the form.
        if (controllerRef.current === controller) dispatch({ type: REQUEST_ACTION.cancel, word });
        return;
      }
      dispatch({ type: REQUEST_ACTION.fail, word, failure });
      if (failure.kind === FAILURE_KIND.rateLimited) saveSafely(() => saveRateLimited(failure.retryAfterMs));
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  };

  return { state, send };
}
