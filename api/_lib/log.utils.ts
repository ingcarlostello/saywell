// One JSON line per event in the Vercel logs. Callers pass only safe fields: never keys, tokens, the user's
// text, model output (it echoes the user's text), client ids or raw upstream messages (UpstashError messages
// embed the script and the keys).
type LogFields = Readonly<Record<string, string | number | boolean | undefined>>;

export function logInfo(event: string, fields: LogFields = {}): void {
  console.info(JSON.stringify({ event, ...fields }));
}

export function logWarning(event: string, fields: LogFields = {}): void {
  console.warn(JSON.stringify({ event, ...fields }));
}

export function toErrorName(error: unknown): string {
  return error instanceof Error ? error.name : typeof error;
}
