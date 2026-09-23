import * as z from 'zod';
import { LANGS } from '@/shared/constants/i18n.constants';
import { INPUT_LIMITS, RESULT_STATUS } from '../constants/pronunciation.constants';
import { rateLimitSnapshotDtoSchema } from './rateLimit.schema';

// CONTRACT: mirrors `pronounceRequestSchema` and `pronounceOkBodySchema` (the 200 body) of
// api/_lib/pronounce.schema.ts; the 429 and error bodies are never read here.
// Vercel compiles api/ without the @/ alias, so the contract is duplicated on purpose. Change both sides
// together. Only the response schemas run here: the request one is the source of `PronounceRequestDto`
// (§14.2 forbids declaring a DTO by hand) and documents the half of the contract the client writes.

export const pronounceRequestDtoSchema = z.strictObject({
  word: z.string().min(1).max(INPUT_LIMITS.maxLength),
  lang: z.enum(LANGS),
});

const pronunciationPartDtoSchema = z.object({
  id: z.string(),
  syllable: z.string(),
  stressed: z.boolean(),
  explanation: z.string(),
});

export const pronunciationResultDtoSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal(RESULT_STATUS.ok),
    word: z.string(),
    phonetic: z.string(),
    parts: z.array(pronunciationPartDtoSchema),
    example: z.string(),
  }),
  z.object({ status: z.literal(RESULT_STATUS.outOfScope) }),
]);

export const pronounceOkBodySchema = z.object({
  result: pronunciationResultDtoSchema,
  rateLimit: rateLimitSnapshotDtoSchema,
});

export type PronounceRequestDto = z.infer<typeof pronounceRequestDtoSchema>;
export type PronunciationResultDto = z.infer<typeof pronunciationResultDtoSchema>;
