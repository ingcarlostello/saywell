import * as z from 'zod';
import {
  ERROR_CODE,
  INPUT,
  IPA_PATTERN,
  LANGS,
  LATIN_LETTER_PATTERN,
  PHONEMIC_SLASHES_PATTERN,
  PHONETIC_PATTERN,
  PRONUNCIATION_LIMITS,
  RESULT_STATUS,
  SUPPORTED_INPUT_PATTERN,
  UPPERCASE_PATTERN,
  WHITESPACE_RUN_PATTERN,
  WRAPPED_CONTENT_GROUP,
  WRAPPING_QUOTES_PATTERN,
} from './pronounce.constants.js';

const collapseWhitespace = (value: string): string => value.replace(WHITESPACE_RUN_PATTERN, ' ').trim();
const stripWrappingQuotes = (value: string): string =>
  value.trim().replace(WRAPPING_QUOTES_PATTERN, WRAPPED_CONTENT_GROUP);
const hasNoIpa = (value: string): boolean => !IPA_PATTERN.test(value) && !PHONEMIC_SLASHES_PATTERN.test(value);

// ── Request ──────────────────────────────────────────────────────────────────────────────────────────────
// CONTRACT: src/features/pronunciation/schemas/pronunciation.schema.ts mirrors this body. Change both
// sides together.

export const pronounceRequestSchema = z.strictObject({
  word: z.string().transform(collapseWhitespace).pipe(z.string().min(1).max(INPUT.wordMaxLength)),
  lang: z.enum(LANGS),
});

export const clientIdSchema = z.uuidv4().transform((id) => id.toLowerCase());

// 422 prefilter, applied to the already normalized word.
export const supportedWordSchema = z.string().regex(SUPPORTED_INPUT_PATTERN).regex(LATIN_LETTER_PATTERN);

// ── LLM output (JSON Output of DeepSeek) ─────────────────────────────────────────────────────────────────

const plainText = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength).refine(hasNoIpa, { message: 'ipa' });

const phoneticText = (maxLength: number) => plainText(maxLength).regex(PHONETIC_PATTERN);

// The stressed part is the only one written with capitals ("de-LI-verd", "gud MOR-ning").
const llmPartSchema = z
  .object({
    syllable: phoneticText(PRONUNCIATION_LIMITS.partMaxLength),
    stressed: z.boolean(),
    explanation: plainText(PRONUNCIATION_LIMITS.explanationMaxLength),
  })
  .refine((part) => UPPERCASE_PATTERN.test(part.syllable) === part.stressed, {
    message: 'stress_case',
    path: ['syllable'],
  });

export const llmPronunciationSchema = z.object({
  status: z.literal(RESULT_STATUS.ok),
  phonetic: phoneticText(PRONUNCIATION_LIMITS.phoneticMaxLength),
  parts: z
    .array(llmPartSchema)
    .min(1)
    .max(PRONUNCIATION_LIMITS.maxParts)
    .refine((parts) => parts.some((part) => part.stressed), { message: 'no_stress' }),
  example: z.string().transform(stripWrappingQuotes).pipe(plainText(PRONUNCIATION_LIMITS.exampleMaxLength)),
});

export const llmOutOfScopeSchema = z.object({ status: z.literal(RESULT_STATUS.outOfScope) });

// z.object (not strict): extra keys the model may add are dropped.
export const llmResultSchema = z.discriminatedUnion('status', [llmPronunciationSchema, llmOutOfScopeSchema]);

// ── DeepSeek envelope (only what is read; finish_reason and model are open strings on purpose) ───────────

export const deepseekEnvelopeSchema = z.object({
  model: z.string().optional(),
  choices: z
    .array(
      z.object({
        finish_reason: z.string().nullish(),
        message: z.object({ content: z.string().nullish() }),
      }),
    )
    .min(1),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
      prompt_cache_hit_tokens: z.number().optional(),
      prompt_cache_miss_tokens: z.number().optional(),
    })
    .optional(),
});

// ── Lua replies (the SDK generic is an unchecked cast) ───────────────────────────────────────────────────

const luaFlagSchema = z.union([z.literal(0), z.literal(1)]);

export const consumeReplySchema = z.tuple([
  luaFlagSchema,
  z.number().int().nonnegative(),
  z.number().int().nonnegative(),
  z.number().int().nonnegative(), // which ceiling denied it (DENIED_BY)
  z.number().int().nonnegative(), // the IP window's own PTTL, for the deny cache
]);

export const refundReplySchema = luaFlagSchema;

// ── Response bodies ──────────────────────────────────────────────────────────────────────────────────────
// CONTRACT: src/features/pronunciation/schemas/* mirrors these bodies (Vercel compiles api/ without the
// @/ alias, so the schemas are duplicated on purpose). Change both sides together.

export const rateLimitSnapshotSchema = z.object({
  limit: z.number().int().positive(),
  remaining: z.number().int().nonnegative(),
  resetInMs: z.number().int().nonnegative(),
});

export const pronunciationPartSchema = z.object({
  id: z.string(),
  syllable: z.string(),
  stressed: z.boolean(),
  explanation: z.string(),
});

export const pronunciationResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal(RESULT_STATUS.ok),
    word: z.string(),
    phonetic: z.string(),
    parts: z.array(pronunciationPartSchema),
    example: z.string(),
  }),
  z.object({ status: z.literal(RESULT_STATUS.outOfScope) }),
]);

export const pronounceOkBodySchema = z.object({
  result: pronunciationResultSchema,
  rateLimit: rateLimitSnapshotSchema,
});

export const rateLimitedBodySchema = z.object({
  error: z.literal(ERROR_CODE.rateLimited),
  rateLimit: rateLimitSnapshotSchema,
});

export const errorBodySchema = z.object({ error: z.enum(ERROR_CODE) });
