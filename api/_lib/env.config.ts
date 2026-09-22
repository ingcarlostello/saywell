import * as z from 'zod';
import { DEFAULT_VERCEL_ENV, HTTP_PROTOCOL_PATTERN, VERCEL_ENVS } from './pronounce.constants.js';

// The only reader of process.env in api/. Literal references, validated once per warm instance; lazy so an
// invalid env answers 500 internal_error instead of crashing the module.
const envSchema = z.object({
  DEEPSEEK_API_KEY: z.string().min(1),
  // Any non-empty id: DeepSeek aliases keep changing (deepseek-chat → deepseek-v4-flash → deepseek-flash).
  DEEPSEEK_MODEL: z.string().trim().min(1).optional(),
  // A rediss:// value (KV_URL) must fail here, not later inside the Redis constructor (which would look
  // like an Upstash outage: 503 on every request).
  KV_REST_API_URL: z.url({ protocol: HTTP_PROTOCOL_PATTERN }),
  KV_REST_API_TOKEN: z.string().min(1),
  VERCEL_ENV: z.enum(VERCEL_ENVS).default(DEFAULT_VERCEL_ENV),
});

export type ServerEnv = Readonly<z.infer<typeof envSchema>>;

export class EnvError extends Error {
  readonly invalidKeys: readonly string[];

  constructor(invalidKeys: readonly string[]) {
    super(`Invalid server env: ${invalidKeys.join(', ')}`);
    this.name = 'EnvError';
    this.invalidKeys = invalidKeys;
  }
}

let cachedEnv: ServerEnv | undefined;

export function getEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;
  // `||` so an empty string falls through to the alternative name (Upstash's own integration).
  const parsed = envSchema.safeParse({
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || undefined,
    KV_REST_API_URL: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
    VERCEL_ENV: process.env.VERCEL_ENV || undefined,
  });
  if (!parsed.success) throw new EnvError(parsed.error.issues.map((issue) => issue.path.join('.')));
  cachedEnv = Object.freeze(parsed.data);
  return cachedEnv;
}
