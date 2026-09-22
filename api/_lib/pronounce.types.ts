import type * as z from 'zod';
import type { ERROR_CODE, LANGS, UPSTREAM_ERROR_KIND } from './pronounce.constants.js';
import type {
  errorBodySchema,
  llmPronunciationSchema,
  llmResultSchema,
  pronounceOkBodySchema,
  pronunciationResultSchema,
  rateLimitedBodySchema,
  rateLimitSnapshotSchema,
} from './pronounce.schema.js';

export type Lang = (typeof LANGS)[number];

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];

export type LlmResult = z.infer<typeof llmResultSchema>;

// Shape the prompt examples are checked against (`satisfies`), before the schema transforms.
export type LlmPronunciationExample = z.input<typeof llmPronunciationSchema>;

export type RateLimitSnapshot = z.infer<typeof rateLimitSnapshotSchema>;

export type PronunciationResult = z.infer<typeof pronunciationResultSchema>;

export type PronounceOkBody = z.infer<typeof pronounceOkBodySchema>;

export type RateLimitedBody = z.infer<typeof rateLimitedBodySchema>;

export type ErrorBody = z.infer<typeof errorBodySchema>;

export type JsonBodyResult =
  | { ok: true; value: unknown }
  | { ok: false; error: typeof ERROR_CODE.invalidJson | typeof ERROR_CODE.payloadTooLarge };

export interface RateLimitKeys {
  clientKey: string;
  ipKey: string;
}

export interface RateLimitDecision {
  allowed: boolean;
  snapshot: RateLimitSnapshot;
}

export interface PronunciationInput {
  word: string;
  lang: Lang;
  clientId: string;
}

export type UpstreamErrorKind = (typeof UPSTREAM_ERROR_KIND)[keyof typeof UPSTREAM_ERROR_KIND];
