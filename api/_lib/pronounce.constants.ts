export const LANGS = ['es', 'en'] as const;

export const VERCEL_ENVS = ['production', 'preview', 'development'] as const;

// `vercel dev` may not inject VERCEL_ENV into functions; local keys then live under rl:development:…
export const DEFAULT_VERCEL_ENV = 'development';

export const HTTP_METHOD = { post: 'POST' } as const;

export const HTTP_STATUS = {
  ok: 200,
  badRequest: 400,
  methodNotAllowed: 405,
  payloadTooLarge: 413,
  unprocessable: 422,
  tooManyRequests: 429,
  internalError: 500,
  badGateway: 502,
  serviceUnavailable: 503,
  gatewayTimeout: 504,
} as const;

export const HEADER = {
  allow: 'Allow',
  retryAfter: 'Retry-After',
  contentLength: 'content-length',
  authorization: 'Authorization',
  contentType: 'Content-Type',
  clientId: 'x-client-id',
} as const;

export const JSON_MEDIA_TYPE = 'application/json';

// x-vercel-forwarded-for survives a proxy in front of Vercel; the first X-Forwarded-For entry is spoofable
// under `vercel dev`, so it goes last.
export const CLIENT_IP_HEADERS = ['x-vercel-forwarded-for', 'x-real-ip', 'x-forwarded-for'] as const;

// Only reachable off-platform (no Vercel proxy headers): every such request shares one IP bucket.
export const UNKNOWN_CLIENT_IP = 'unknown';

export const IPV6_BUCKET_HEXTETS = 4; // /64: rotating addresses inside one subnet cannot dodge the IP ceiling
export const IPV6_TOTAL_HEXTETS = 8;
export const IPV6_BUCKET_SUFFIX = '::/64';
export const IPV4_MAPPED_PATTERN = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i;
export const IPV6_DECORATION_PATTERN = /^\[|\](?::\d+)?$|%.*$/g; // [brackets], :port after brackets, %zone
export const LEADING_ZEROS_PATTERN = /^0+(?=.)/;

export const ERROR_CODE = {
  methodNotAllowed: 'method_not_allowed',
  invalidJson: 'invalid_json',
  invalidBody: 'invalid_body',
  invalidClientId: 'invalid_client_id',
  payloadTooLarge: 'payload_too_large',
  unsupportedInput: 'unsupported_input',
  rateLimited: 'rate_limited',
  upstreamError: 'upstream_error',
  upstreamTimeout: 'upstream_timeout',
  rateLimitUnavailable: 'rate_limit_unavailable',
  internalError: 'internal_error',
} as const;

export const INPUT = {
  maxBodyBytes: 1024,
  wordMaxLength: 50,
} as const;

// Prefilter before spending quota (422): Latin letters with diacritics, digits and the punctuation of short
// phrases. Emojis and other scripts never reach the LLM.
export const SUPPORTED_INPUT_PATTERN = /^[\p{Script=Latin}\p{M}\d\s'’.,!?&-]+$/u;
export const LATIN_LETTER_PATTERN = /\p{Script=Latin}/u;

export const WHITESPACE_RUN_PATTERN = /\s+/g;
// Only a real wrapping pair: an example that merely ends with a quoted word keeps its quotes balanced.
export const WRAPPING_QUOTES_PATTERN = /^(["“”'‘’])([\s\S]*)(["“”'’])$/;
export const WRAPPED_CONTENT_GROUP = '$2';

export const RESULT_STATUS = { ok: 'ok', outOfScope: 'out_of_scope' } as const;

export const UPSTREAM_ERROR_KIND = { timeout: 'timeout', failed: 'failed' } as const;

export const ATTEMPT_OUTCOME = { result: 'result', retry: 'retry', fail: 'fail' } as const;

export const TIMEOUT_ERROR_NAME = 'TimeoutError';

// The Upstash REST client only accepts http(s); KV_URL (rediss://) is the usual paste error, and it must
// fail env validation instead of the Redis constructor.
export const HTTP_PROTOCOL_PATTERN = /^https?$/;

export const PRONUNCIATION_LIMITS = {
  maxParts: 12,
  phoneticMaxLength: 160,
  partMaxLength: 40,
  explanationMaxLength: 240,
  exampleMaxLength: 240,
} as const;

export const PART_ID_PREFIX = 'p';

// "Fonética casera": plain letters only. The IPA blocks plus the IPA letters outside them: æ/ð (Latin-1),
// ŋ (Latin Ext-A), θ (Greek).
export const IPA_PATTERN = /[ɐ-˿ᴀ-ᶿæðŋθ]/u;
// Phonemic notation (/ei/, [dog]), not a plain slash: "t/d/r", "24/7" and "km/h" are legitimate explanations.
export const PHONEMIC_SLASHES_PATTERN = /(?<!\p{L})\/[^/\s]+\/(?!\p{L})|\[[^\]\s]+\]/u;
export const PHONETIC_PATTERN = /^[\p{Script=Latin}\p{M}\s'’-]+$/u;
export const UPPERCASE_PATTERN = /\p{Lu}/u;

export const DEEPSEEK = {
  url: 'https://api.deepseek.com/chat/completions',
  defaultModel: 'deepseek-flash',
  temperature: 0.3, // honored only because thinking is disabled
  maxTokens: 1400, // a ceiling, not a cost: 900 could truncate 12-part phrases
  timeoutMs: 20_000, // ONE deadline shared by both attempts, body read included
  maxAttempts: 2,
  minRetryBudgetMs: 4_000,
  retryDelayMs: 500,
} as const;

export const DEEPSEEK_RETRYABLE_STATUS: readonly number[] = [
  HTTP_STATUS.tooManyRequests,
  HTTP_STATUS.internalError,
  HTTP_STATUS.badGateway,
  HTTP_STATUS.serviceUnavailable,
  HTTP_STATUS.gatewayTimeout,
];

export const DEEPSEEK_FINISH = {
  length: 'length',
  contentFilter: 'content_filter',
  insufficientResources: 'insufficient_system_resource',
  aborted: 'aborted',
} as const;

export const THINKING_DISABLED = { type: 'disabled' } as const;
export const JSON_RESPONSE_FORMAT = { type: 'json_object' } as const;

export const MESSAGE_ROLE = { system: 'system', user: 'user' } as const;

export const RATE_LIMIT = {
  clientLimit: 30,
  ipLimit: 90,
  windowMs: 3_600_000,
  // Per HTTP request, its retry included; a cold script cache costs 2 requests (EVALSHA + EVAL), so a
  // consume or refund takes at most ~2 s, far below maxDuration (30 s).
  redisTimeoutMs: 1_000,
  // A transient DNS or connection blip must not become a user-facing 503; a failed attempt costs
  // milliseconds, so 2 retries with 100/200 ms of backoff still fit inside the 1 s budget above.
  redisRetries: 2,
  redisRetryBackoffMs: 100,
  keyPrefix: 'rl',
  clientSegment: 'c',
  ipSegment: 'ip',
  // A denied IP bucket is remembered in memory so a flood costs no Redis commands (Upstash bills every
  // command inside the script, and the free tier is a monthly budget). Re-checked at least this often.
  denyCacheMaxAgeMs: 300_000,
  denyCacheMaxEntries: 5_000,
} as const;

// Which ceiling denied the request: 1 = the client's, 2 = the IP's, 3 = both. Only the IP one is cached:
// the client counter can be refunded after a 502, and a stale entry would block a user who has quota again.
export const DENIED_BY = { client: 1, ip: 2 } as const;

export const MS_PER_SECOND = 1_000;

export const HASH = { algorithm: 'sha256', encoding: 'hex' } as const;

export const LOG_EVENT = {
  env: 'env_invalid',
  rateLimit: 'rate_limit_unavailable',
  refund: 'rate_limit_refund_failed',
  deepseek: 'deepseek',
  deepseekFailed: 'deepseek_failed',
  unexpected: 'unexpected_error',
} as const;

// Atomic scripts for Upstash. The shebang must be the very first characters: without it Upstash takes a
// database-wide lock for every call. Lua 5.1-safe (no //, no math.tointeger); every key goes through KEYS.
// CONSUME returns {allowed (0|1), remaining = min(client, ip), resetInMs of the binding key, blocked,
// ipResetInMs}, where blocked is 0, or DENIED_BY.client / .ip / their sum, and ipResetInMs is the IP
// window's own PTTL (what the deny cache needs; the binding reset may belong to the client). The first
// request of a window creates the key with its TTL (the window starts there); an exhausted window is not
// incremented; a counter left without TTL is healed without granting quota.
export const CONSUME_SCRIPT = `#!lua flags=allow-key-locking
local climit = tonumber(ARGV[1])
local ilimit = tonumber(ARGV[2])
local window = tonumber(ARGV[3])
if not climit or not ilimit or not window or window <= 0 then
  return redis.error_reply('ERR rate limit: invalid arguments')
end

local function read(key)
  local ttl = redis.call('PTTL', key)
  if ttl == -2 then return 0, -2 end
  local count = tonumber(redis.call('GET', key))
  if not count then return nil, ttl end
  if ttl == -1 then
    redis.call('PEXPIRE', key, window)
    ttl = window
  end
  return count, ttl
end

local function bump(key, ttl)
  if ttl == -2 then
    redis.call('SET', key, '1', 'PX', window)
    return 1, window
  end
  return redis.call('INCR', key), ttl
end

local c, cttl = read(KEYS[1])
local i, ittl = read(KEYS[2])
if not c or not i then
  return redis.error_reply('ERR rate limit: corrupt counter')
end

local allowed = 0
if c < climit and i < ilimit then
  allowed = 1
  c, cttl = bump(KEYS[1], cttl)
  i, ittl = bump(KEYS[2], ittl)
end

local crem = climit - c
if crem < 0 then crem = 0 end
local irem = ilimit - i
if irem < 0 then irem = 0 end
local remaining = crem
if irem < remaining then remaining = irem end

local reset = 0
if crem == remaining and cttl > reset then reset = cttl end
if irem == remaining and ittl > reset then reset = ittl end

local blocked = 0
if allowed == 0 then
  if c >= climit then blocked = 1 end
  if i >= ilimit then blocked = blocked + 2 end
end
local ipreset = 0
if ittl > 0 then ipreset = ittl end
return {allowed, remaining, reset, blocked, ipreset}
`;

// Gives back the client's unit after a 502/504. Never creates a key and never touches its TTL (a DECR on
// an expired key would leave -1 without TTL). The IP ceiling is not refunded: it bounds the DeepSeek cost
// of anyone able to force upstream failures.
export const REFUND_SCRIPT = `#!lua flags=allow-key-locking
local count = tonumber(redis.call('GET', KEYS[1]))
if not count or count <= 0 then return 0 end
redis.call('SET', KEYS[1], tostring(count - 1), 'XX', 'KEEPTTL')
return 1
`;
