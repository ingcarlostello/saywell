import { API_ERROR_KIND } from '@/shared/api/api.constants';
import type { RequestOptions } from '@/shared/api/api.types';
import { apiClient } from '@/shared/api/apiClient';
import { ApiError } from '@/shared/api/ApiError';
import { toPronounceRequestDto, toPronunciationResult } from '../adapters/pronunciation.adapter';
import { toRateLimitSnapshot } from '../adapters/rateLimit.adapter';
import { PRONUNCIATION_ENDPOINTS, PRONUNCIATION_HEADERS } from '../constants/pronunciation.constants';
import { pronounceOkBodySchema } from '../schemas/pronunciation.schema';
import type { PronunciationInput, PronunciationResponse } from '../types/pronunciation.types';

// POST /api/pronounce. Errors stay as `ApiError` (§12.6 #14): the UI decides the feedback.
export async function requestPronunciation(
  input: PronunciationInput,
  options?: RequestOptions,
): Promise<PronunciationResponse> {
  const raw = await apiClient.post(PRONUNCIATION_ENDPOINTS.pronounce, toPronounceRequestDto(input), {
    headers: { [PRONUNCIATION_HEADERS.clientId]: input.clientId },
    signal: options?.signal,
  });
  const body = pronounceOkBodySchema.safeParse(raw);
  if (!body.success) {
    throw new ApiError(API_ERROR_KIND.contract, `Invalid body in POST ${PRONUNCIATION_ENDPOINTS.pronounce}`, {
      cause: body.error,
    });
  }
  // The window is anchored when the answer arrives: the server measures what is left, not when it ends.
  return {
    result: toPronunciationResult(body.data.result, input.word),
    rateLimit: toRateLimitSnapshot(body.data.rateLimit, { now: Date.now() }),
  };
}
