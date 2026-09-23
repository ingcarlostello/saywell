import { createHmac } from 'node:crypto';
import { Redis } from '@upstash/redis';
import type { ServerEnv } from './env.config.js';
import { CONSUME_SCRIPT, DENIED_BY, HASH, RATE_LIMIT, REFUND_SCRIPT } from './pronounce.constants.js';
import { consumeReplySchema, refundReplySchema } from './pronounce.schema.js';
import type { RateLimitDecision, RateLimitKeys } from './pronounce.types.js';

interface RateLimitScripts {
  consume: ReturnType<Redis['createScript']>;
  refund: ReturnType<Redis['createScript']>;
}

// One client per warm instance (Fluid compute): keep-alive and the script SHAs are reused across requests.
let scripts: RateLimitScripts | undefined;

function getScripts(env: ServerEnv): RateLimitScripts {
  if (scripts) return scripts;
  const redis = new Redis({
    url: env.KV_REST_API_URL,
    token: env.KV_REST_API_TOKEN,
    // Fail closed fast: the SDK default is 5 retries (~4 s) and no timeout at all.
    // The SDK counts retries from 0: +1 so the first one waits too (100/200 ms), not 0/100 ms.
    retry: {
      retries: RATE_LIMIT.redisRetries,
      backoff: (retryIndex) => (retryIndex + 1) * RATE_LIMIT.redisRetryBackoffMs,
    },
    // A factory, never a static signal: an aborted static signal would poison every later request.
    signal: () => AbortSignal.timeout(RATE_LIMIT.redisTimeoutMs),
    enableAutoPipelining: false,
    enableTelemetry: false,
  });
  // exec() sends EVALSHA and falls back to EVAL on NOSCRIPT.
  scripts = { consume: redis.createScript<unknown>(CONSUME_SCRIPT), refund: redis.createScript<unknown>(REFUND_SCRIPT) };
  return scripts;
}

// The IP bucket is stored as an HMAC keyed with a server secret: a plain SHA-256 of an IPv4 address can be
// reversed by brute force. Rotating the Upstash token only restarts the IP windows.
export function toRateLimitKeys(env: ServerEnv, clientId: string, ipBucket: string): RateLimitKeys {
  const prefix = `${RATE_LIMIT.keyPrefix}:${env.VERCEL_ENV}`;
  const ipHash = createHmac(HASH.algorithm, env.KV_REST_API_TOKEN).update(ipBucket).digest(HASH.encoding);
  return {
    clientKey: `${prefix}:${RATE_LIMIT.clientSegment}:${clientId}`,
    ipKey: `${prefix}:${RATE_LIMIT.ipSegment}:${ipHash}`,
  };
}

// IP buckets already denied by Redis, so a flood costs no commands. Entries are dropped when their window
// ends or when they get stale, and only ever deny what Redis just denied.
const deniedIps = new Map<string, { untilMs: number; checkedAtMs: number }>();

function readDenyCache(ipKey: string, nowMs: number): number | undefined {
  const entry = deniedIps.get(ipKey);
  if (!entry) return undefined;
  const fresh = entry.untilMs > nowMs && nowMs - entry.checkedAtMs < RATE_LIMIT.denyCacheMaxAgeMs;
  if (!fresh) {
    deniedIps.delete(ipKey);
    return undefined;
  }
  return entry.untilMs - nowMs;
}

function writeDenyCache(ipKey: string, resetInMs: number, nowMs: number): void {
  if (deniedIps.size >= RATE_LIMIT.denyCacheMaxEntries) {
    for (const [key, entry] of deniedIps) if (entry.untilMs <= nowMs) deniedIps.delete(key);
    if (deniedIps.size >= RATE_LIMIT.denyCacheMaxEntries) deniedIps.clear();
  }
  deniedIps.set(ipKey, { untilMs: nowMs + resetInMs, checkedAtMs: nowMs });
}

const deniedSnapshot = (resetInMs: number): RateLimitDecision => ({
  allowed: false,
  snapshot: { limit: RATE_LIMIT.clientLimit, remaining: 0, resetInMs },
});

// Throws on any failure (network TypeError, TimeoutError, UpstashError, invalid reply): the caller answers
// 503 rate_limit_unavailable.
export async function consumeRateLimit(env: ServerEnv, keys: RateLimitKeys): Promise<RateLimitDecision> {
  const nowMs = Date.now();
  const cachedResetInMs = readDenyCache(keys.ipKey, nowMs);
  if (cachedResetInMs !== undefined) return deniedSnapshot(cachedResetInMs);

  const reply = await getScripts(env).consume.exec(
    [keys.clientKey, keys.ipKey],
    [String(RATE_LIMIT.clientLimit), String(RATE_LIMIT.ipLimit), String(RATE_LIMIT.windowMs)],
  );
  const [allowed, remaining, resetInMs, blocked, ipResetInMs] = consumeReplySchema.parse(reply);
  if (blocked >= DENIED_BY.ip && ipResetInMs > 0) writeDenyCache(keys.ipKey, ipResetInMs, nowMs);
  return { allowed: allowed === 1, snapshot: { limit: RATE_LIMIT.clientLimit, remaining, resetInMs } };
}

// Gives the client's unit back after an upstream failure (502/504). Resolves to false when nothing was
// refunded (the window expired meanwhile or the counter was already 0).
export async function refundRateLimit(env: ServerEnv, keys: RateLimitKeys): Promise<boolean> {
  const reply = await getScripts(env).refund.exec([keys.clientKey], []);
  return refundReplySchema.parse(reply) === 1;
}
