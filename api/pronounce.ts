import { fetchPronunciation, UpstreamError } from './_lib/deepseek.services.js';
import { EnvError, getEnv, type ServerEnv } from './_lib/env.config.js';
import { errorResponse, getClientIpBucket, jsonResponse, readJsonBody } from './_lib/http.utils.js';
import { logWarning, toErrorName } from './_lib/log.utils.js';
import {
  ERROR_CODE,
  HEADER,
  HTTP_METHOD,
  HTTP_STATUS,
  INPUT,
  LOG_EVENT,
  MS_PER_SECOND,
  UPSTREAM_ERROR_KIND,
} from './_lib/pronounce.constants.js';
import { clientIdSchema, pronounceRequestSchema, supportedWordSchema } from './_lib/pronounce.schema.js';
import type { PronounceOkBody, RateLimitDecision, RateLimitedBody, RateLimitKeys } from './_lib/pronounce.types.js';
import { consumeRateLimit, refundRateLimit, toRateLimitKeys } from './_lib/rateLimit.services.js';

// A failed refund keeps the original 502/504 answer: the user only loses one unit of quota.
async function refundQuietly(env: ServerEnv, keys: RateLimitKeys): Promise<void> {
  try {
    await refundRateLimit(env, keys);
  } catch (error) {
    logWarning(LOG_EVENT.refund, { error: toErrorName(error) });
  }
}

async function handle(request: Request): Promise<Response> {
  if (request.method !== HTTP_METHOD.post) {
    return errorResponse(HTTP_STATUS.methodNotAllowed, ERROR_CODE.methodNotAllowed, { [HEADER.allow]: HTTP_METHOD.post });
  }

  let env: ServerEnv;
  try {
    env = getEnv();
  } catch (error) {
    const keys = error instanceof EnvError ? error.invalidKeys.join(',') : toErrorName(error);
    logWarning(LOG_EVENT.env, { keys });
    return errorResponse(HTTP_STATUS.internalError, ERROR_CODE.internalError);
  }

  const body = await readJsonBody(request, INPUT.maxBodyBytes);
  if (!body.ok) {
    const status = body.error === ERROR_CODE.payloadTooLarge ? HTTP_STATUS.payloadTooLarge : HTTP_STATUS.badRequest;
    return errorResponse(status, body.error);
  }
  const input = pronounceRequestSchema.safeParse(body.value);
  if (!input.success) return errorResponse(HTTP_STATUS.badRequest, ERROR_CODE.invalidBody);
  const clientId = clientIdSchema.safeParse(request.headers.get(HEADER.clientId));
  if (!clientId.success) return errorResponse(HTTP_STATUS.badRequest, ERROR_CODE.invalidClientId);
  if (!supportedWordSchema.safeParse(input.data.word).success) {
    return errorResponse(HTTP_STATUS.unprocessable, ERROR_CODE.unsupportedInput);
  }

  // Fail closed: without the rate limit nothing bounds the DeepSeek bill.
  const keys = toRateLimitKeys(env, clientId.data, getClientIpBucket(request.headers));
  let decision: RateLimitDecision;
  try {
    decision = await consumeRateLimit(env, keys);
  } catch (error) {
    logWarning(LOG_EVENT.rateLimit, { error: toErrorName(error) });
    return errorResponse(HTTP_STATUS.serviceUnavailable, ERROR_CODE.rateLimitUnavailable);
  }
  if (!decision.allowed) {
    const retryAfterSeconds = Math.max(1, Math.ceil(decision.snapshot.resetInMs / MS_PER_SECOND));
    const limited: RateLimitedBody = { error: ERROR_CODE.rateLimited, rateLimit: decision.snapshot };
    return jsonResponse(HTTP_STATUS.tooManyRequests, limited, { [HEADER.retryAfter]: String(retryAfterSeconds) });
  }

  try {
    const result = await fetchPronunciation(env, { ...input.data, clientId: clientId.data });
    const ok: PronounceOkBody = { result, rateLimit: decision.snapshot };
    return jsonResponse(HTTP_STATUS.ok, ok);
  } catch (error) {
    await refundQuietly(env, keys);
    const timedOut = error instanceof UpstreamError && error.kind === UPSTREAM_ERROR_KIND.timeout;
    if (timedOut) logWarning(LOG_EVENT.deepseekFailed, { outcome: 'timeout' });
    else if (!(error instanceof UpstreamError)) logWarning(LOG_EVENT.unexpected, { error: toErrorName(error) });
    return timedOut
      ? errorResponse(HTTP_STATUS.gatewayTimeout, ERROR_CODE.upstreamTimeout)
      : errorResponse(HTTP_STATUS.badGateway, ERROR_CODE.upstreamError);
  }
}

// POST /api/pronounce. Never uses `this`: the runtime calls the detached `fetch`.
export default {
  async fetch(request: Request): Promise<Response> {
    try {
      return await handle(request);
    } catch (error) {
      logWarning(LOG_EVENT.unexpected, { error: toErrorName(error) });
      return errorResponse(HTTP_STATUS.internalError, ERROR_CODE.internalError);
    }
  },
};
