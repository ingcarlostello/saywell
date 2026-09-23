import { createHash } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import type { ServerEnv } from './env.config.js';
import { logInfo, logWarning } from './log.utils.js';
import {
  ATTEMPT_OUTCOME,
  DEEPSEEK,
  DEEPSEEK_FINISH,
  DEEPSEEK_RETRYABLE_STATUS,
  HASH,
  HEADER,
  HTTP_METHOD,
  JSON_MEDIA_TYPE,
  JSON_RESPONSE_FORMAT,
  LOG_EVENT,
  LOGGED_ISSUES_MAX,
  MESSAGE_ROLE,
  PART_ID_PREFIX,
  RESULT_STATUS,
  SCHEMA_ISSUE,
  THINKING_DISABLED,
  TIMEOUT_ERROR_NAME,
  UPSTREAM_ERROR_KIND,
} from './pronounce.constants.js';
import { deepseekEnvelopeSchema, llmResultSchema } from './pronounce.schema.js';
import type {
  LlmIssue,
  LlmResult,
  PronunciationInput,
  PronunciationResult,
  UpstreamErrorKind,
} from './pronounce.types.js';
import { SYSTEM_PROMPTS } from './prompts.constants.js';

export class UpstreamError extends Error {
  readonly kind: UpstreamErrorKind;

  constructor(kind: UpstreamErrorKind, reason: string) {
    super(`DeepSeek ${kind}: ${reason}`);
    this.name = 'UpstreamError';
    this.kind = kind;
  }
}

type AttemptOutcome =
  | { type: typeof ATTEMPT_OUTCOME.result; result: LlmResult }
  | { type: typeof ATTEMPT_OUTCOME.retry; reason: string; issues?: string }
  | { type: typeof ATTEMPT_OUTCOME.fail; reason: string };

const isTimeout = (error: unknown): boolean => error instanceof Error && error.name === TIMEOUT_ERROR_NAME;

const LOGGABLE_ISSUE_MESSAGES: ReadonlySet<string> = new Set(Object.values(SCHEMA_ISSUE));

// Which rules a rejected answer broke ("parts.0.syllable:stress_case"), never its content: zod drops the
// input from final issues, paths are schema keys and indexes, and only our own refinement messages are printed.
function toIssueSummary(issues: readonly LlmIssue[]): string {
  return issues
    .slice(0, LOGGED_ISSUES_MAX)
    .map((issue) => {
      const rule = LOGGABLE_ISSUE_MESSAGES.has(issue.message) ? issue.message : issue.code;
      return `${issue.path.map(String).join('.')}:${rule}`;
    })
    .join(',');
}

function toRequestBody(env: ServerEnv, input: PronunciationInput): string {
  return JSON.stringify({
    model: env.DEEPSEEK_MODEL ?? DEEPSEEK.defaultModel,
    messages: [
      { role: MESSAGE_ROLE.system, content: SYSTEM_PROMPTS[input.lang] },
      // The user's text travels as data, never as an instruction.
      { role: MESSAGE_ROLE.user, content: JSON.stringify({ input: input.word }) },
    ],
    thinking: THINKING_DISABLED,
    response_format: JSON_RESPONSE_FORMAT,
    temperature: DEEPSEEK.temperature,
    max_tokens: DEEPSEEK.maxTokens,
    stream: false,
    // Per-device isolation for DeepSeek's content safety, without sending the device id itself.
    user_id: createHash(HASH.algorithm).update(input.clientId).digest(HASH.encoding),
  });
}

function toOutcome(content: string): AttemptOutcome {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    return { type: ATTEMPT_OUTCOME.retry, reason: 'invalid_json' };
  }
  const result = llmResultSchema.safeParse(data);
  return result.success
    ? { type: ATTEMPT_OUTCOME.result, result: result.data }
    : { type: ATTEMPT_OUTCOME.retry, reason: 'invalid_result', issues: toIssueSummary(result.error.issues) };
}

// One call to DeepSeek. Throws UpstreamError('timeout') when the shared deadline fires, headers or body.
async function attempt(apiKey: string, body: string, deadline: AbortSignal, attemptNumber: number): Promise<AttemptOutcome> {
  let response: Response;
  let payload: unknown;
  try {
    response = await fetch(DEEPSEEK.url, {
      method: HTTP_METHOD.post,
      headers: { [HEADER.contentType]: JSON_MEDIA_TYPE, [HEADER.authorization]: `Bearer ${apiKey}` },
      body,
      signal: deadline,
    });
    if (!response.ok) {
      await response.body?.cancel();
      const reason = `status_${response.status}`; // 402 = prepaid balance exhausted
      return DEEPSEEK_RETRYABLE_STATUS.includes(response.status)
        ? { type: ATTEMPT_OUTCOME.retry, reason }
        : { type: ATTEMPT_OUTCOME.fail, reason };
    }
    // While the request is queued DeepSeek sends 200 plus blank lines; the deadline also covers this read.
    payload = await response.json();
  } catch (error) {
    if (isTimeout(error)) throw new UpstreamError(UPSTREAM_ERROR_KIND.timeout, 'deadline');
    return { type: ATTEMPT_OUTCOME.retry, reason: error instanceof SyntaxError ? 'unparsable_body' : 'network' };
  }

  const envelope = deepseekEnvelopeSchema.safeParse(payload);
  const choice = envelope.success ? envelope.data.choices[0] : undefined;
  if (!envelope.success || !choice) return { type: ATTEMPT_OUTCOME.retry, reason: 'invalid_envelope' };

  const { usage } = envelope.data;
  logInfo(LOG_EVENT.deepseek, {
    attempt: attemptNumber,
    model: envelope.data.model,
    finishReason: choice.finish_reason ?? undefined,
    promptTokens: usage?.prompt_tokens,
    completionTokens: usage?.completion_tokens,
    cacheHitTokens: usage?.prompt_cache_hit_tokens,
  });

  switch (choice.finish_reason) {
    case DEEPSEEK_FINISH.length:
      return { type: ATTEMPT_OUTCOME.fail, reason: 'truncated' }; // same prompt, same cap: a retry would truncate again
    case DEEPSEEK_FINISH.contentFilter:
      return { type: ATTEMPT_OUTCOME.result, result: { status: RESULT_STATUS.outOfScope } };
    case DEEPSEEK_FINISH.insufficientResources:
    case DEEPSEEK_FINISH.aborted:
      return { type: ATTEMPT_OUTCOME.retry, reason: choice.finish_reason };
    default: {
      const content = choice.message.content?.trim();
      return content ? toOutcome(content) : { type: ATTEMPT_OUTCOME.retry, reason: 'empty_content' };
    }
  }
}

// Stable ids (p1, p2…) come from the backend, and the word shown is the normalized input, not the model echo.
function toPronunciationResult(result: LlmResult, word: string): PronunciationResult {
  if (result.status === RESULT_STATUS.outOfScope) return result;
  return {
    status: result.status,
    word,
    phonetic: result.phonetic,
    parts: result.parts.map((part, index) => ({ id: `${PART_ID_PREFIX}${index + 1}`, ...part })),
    example: result.example,
  };
}

// At most 2 attempts inside ONE 20 s deadline. Retries network errors, 429/5xx, empty or invalid output and
// resource interruptions; never 400/401/402/422 nor a truncated answer. Throws UpstreamError.
export async function fetchPronunciation(env: ServerEnv, input: PronunciationInput): Promise<PronunciationResult> {
  const deadline = AbortSignal.timeout(DEEPSEEK.timeoutMs);
  const startedAt = Date.now();
  const body = toRequestBody(env, input);

  for (let attemptNumber = 1; ; attemptNumber += 1) {
    const outcome = await attempt(env.DEEPSEEK_API_KEY, body, deadline, attemptNumber);
    if (outcome.type === ATTEMPT_OUTCOME.result) return toPronunciationResult(outcome.result, input.word);
    const issues = outcome.type === ATTEMPT_OUTCOME.retry ? outcome.issues : undefined;
    logWarning(LOG_EVENT.deepseekFailed, { attempt: attemptNumber, outcome: outcome.type, reason: outcome.reason, issues });

    const budgetLeftMs = DEEPSEEK.timeoutMs - (Date.now() - startedAt) - DEEPSEEK.retryDelayMs;
    const canRetry =
      outcome.type === ATTEMPT_OUTCOME.retry && attemptNumber < DEEPSEEK.maxAttempts && budgetLeftMs >= DEEPSEEK.minRetryBudgetMs;
    if (!canRetry) throw new UpstreamError(UPSTREAM_ERROR_KIND.failed, `${outcome.reason}@${attemptNumber}`);
    await sleep(DEEPSEEK.retryDelayMs);
  }
}
