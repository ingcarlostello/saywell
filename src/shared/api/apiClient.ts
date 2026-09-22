import { DOM_EVENT } from '@/shared/constants/dom.constants';
import {
  API_DEFAULT_TIMEOUT_MS,
  API_ERROR_KIND,
  HTTP_HEADER,
  HTTP_METHOD,
  HTTP_STATUS,
  JSON_MEDIA_TYPE,
  MS_PER_SECOND,
} from './api.constants';
import type { ApiErrorKind, ApiRequestConfig, HttpMethod } from './api.types';
import { ApiError } from './ApiError';

function toErrorKind(status: number): ApiErrorKind {
  if (status === HTTP_STATUS.tooManyRequests) return API_ERROR_KIND.rateLimited;
  if (status === HTTP_STATUS.unprocessable) return API_ERROR_KIND.unprocessable;
  if (status === HTTP_STATUS.gatewayTimeout) return API_ERROR_KIND.timeout;
  if (status >= HTTP_STATUS.serverErrorMin) return API_ERROR_KIND.server;
  return API_ERROR_KIND.unknown;
}

// Retry-After is either delta-seconds or an HTTP date (RFC 9110 §10.2.3).
function parseRetryAfterMs(header: string | null, now: number): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * MS_PER_SECOND);
  const at = Date.parse(header);
  return Number.isNaN(at) ? undefined : Math.max(0, at - now);
}

async function readJson(response: Response, label: string): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    const data: unknown = JSON.parse(text);
    return data;
  } catch (cause) {
    throw new ApiError(API_ERROR_KIND.contract, `Invalid JSON in ${label}`, { status: response.status, cause });
  }
}

async function request(method: HttpMethod, url: string, config: ApiRequestConfig): Promise<unknown> {
  const label = `${method} ${url}`;
  // Combines the caller's signal with a timeout without AbortSignal.any (missing on iOS < 17.4).
  const controller = new AbortController();
  let timedOut = false;
  // An already-aborted caller signal must not reach the network: the server would count the request.
  if (config.signal?.aborted) controller.abort();
  const abortFromCaller = (): void => controller.abort();
  config.signal?.addEventListener(DOM_EVENT.abort, abortFromCaller, { once: true });
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, config.timeoutMs ?? API_DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      credentials: 'same-origin',
      headers: {
        [HTTP_HEADER.accept]: JSON_MEDIA_TYPE,
        [HTTP_HEADER.contentType]: JSON_MEDIA_TYPE,
        ...config.headers,
      },
      body: config.body === undefined ? undefined : JSON.stringify(config.body),
    });
    if (!response.ok) {
      throw new ApiError(toErrorKind(response.status), `HTTP ${response.status} in ${label}`, {
        status: response.status,
        retryAfterMs: parseRetryAfterMs(response.headers.get(HTTP_HEADER.retryAfter), Date.now()),
      });
    }
    return await readJson(response, label);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (timedOut) throw new ApiError(API_ERROR_KIND.timeout, `Timeout in ${label}`, { cause: error });
    if (config.signal?.aborted) throw new ApiError(API_ERROR_KIND.aborted, `Aborted ${label}`, { cause: error });
    throw new ApiError(API_ERROR_KIND.network, `Network error in ${label}`, { cause: error });
  } finally {
    clearTimeout(timer);
    config.signal?.removeEventListener(DOM_EVENT.abort, abortFromCaller);
  }
}

export const apiClient = {
  post: (url: string, body: unknown, config: Omit<ApiRequestConfig, 'body'> = {}): Promise<unknown> =>
    request(HTTP_METHOD.post, url, { ...config, body }),
} as const;
