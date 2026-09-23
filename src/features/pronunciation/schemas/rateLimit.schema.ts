import * as z from 'zod';

// CONTRACT: mirrors `rateLimitSnapshotSchema` in api/_lib/pronounce.schema.ts. Vercel compiles api/ without
// the @/ alias, so the contract is duplicated on purpose. Change both sides together.
export const rateLimitSnapshotDtoSchema = z.object({
  limit: z.number().int().positive(),
  remaining: z.number().int().nonnegative(),
  resetInMs: z.number().int().nonnegative(),
});

export type RateLimitSnapshotDto = z.infer<typeof rateLimitSnapshotDtoSchema>;
