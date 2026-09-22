import type { API_ERROR_KIND, HTTP_METHOD } from './api.constants';

export interface RequestOptions {
  signal?: AbortSignal;
}

export type HttpMethod = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];

export interface ApiRequestConfig extends RequestOptions {
  body?: unknown;
  headers?: Readonly<Record<string, string>>;
  timeoutMs?: number;
}

export type ApiErrorKind = (typeof API_ERROR_KIND)[keyof typeof API_ERROR_KIND];

export interface ApiErrorOptions {
  status?: number;
  retryAfterMs?: number;
  cause?: unknown;
}
