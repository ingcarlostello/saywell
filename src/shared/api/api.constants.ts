export const API_ERROR_KIND = {
  network: 'network',
  timeout: 'timeout',
  aborted: 'aborted',
  unprocessable: 'unprocessable',
  rateLimited: 'rate_limited',
  server: 'server',
  contract: 'contract',
  unknown: 'unknown',
} as const;

export const HTTP_STATUS = {
  unprocessable: 422,
  tooManyRequests: 429,
  gatewayTimeout: 504,
  serverErrorMin: 500,
} as const;

export const HTTP_METHOD = { post: 'POST' } as const;

export const HTTP_HEADER = {
  accept: 'Accept',
  contentType: 'Content-Type',
  retryAfter: 'Retry-After',
} as const;

export const JSON_MEDIA_TYPE = 'application/json';

// Must exceed the server budget (api/pronounce.ts maxDuration = 30 s) so a request the server
// already counted is never aborted by the client.
export const API_DEFAULT_TIMEOUT_MS = 35_000;

export const MS_PER_SECOND = 1_000;
