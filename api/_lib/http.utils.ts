import {
  CLIENT_IP_HEADERS,
  ERROR_CODE,
  HEADER,
  IPV4_MAPPED_PATTERN,
  IPV6_BUCKET_HEXTETS,
  IPV6_BUCKET_SUFFIX,
  IPV6_DECORATION_PATTERN,
  IPV6_TOTAL_HEXTETS,
  JSON_MEDIA_TYPE,
  LEADING_ZEROS_PATTERN,
  UNKNOWN_CLIENT_IP,
} from './pronounce.constants.js';
import type { ErrorBody, ErrorCode, JsonBodyResult } from './pronounce.types.js';

const BASE_HEADERS = {
  [HEADER.contentType]: `${JSON_MEDIA_TYPE}; charset=utf-8`,
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
} as const;

export function jsonResponse(
  status: number,
  body: unknown,
  headers: Readonly<Record<string, string>> = {},
): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...BASE_HEADERS, ...headers } });
}

export function errorResponse(
  status: number,
  error: ErrorCode,
  headers: Readonly<Record<string, string>> = {},
): Response {
  const body: ErrorBody = { error };
  return jsonResponse(status, body, headers);
}

// Streams the body with a hard byte cap, so an oversized payload is never buffered whole.
export async function readJsonBody(request: Request, maxBytes: number): Promise<JsonBodyResult> {
  const declaredBytes = Number(request.headers.get(HEADER.contentLength));
  if (declaredBytes > maxBytes) return { ok: false, error: ERROR_CODE.payloadTooLarge };
  if (!request.body) return { ok: false, error: ERROR_CODE.invalidJson };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        return { ok: false, error: ERROR_CODE.payloadTooLarge };
      }
      chunks.push(value);
    }
    const text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
    const value: unknown = JSON.parse(text);
    return { ok: true, value };
  } catch {
    // Aborted upload, invalid UTF-8 or invalid JSON: all of them are a malformed body for the client.
    return { ok: false, error: ERROR_CODE.invalidJson };
  }
}

// First 64 bits of an IPv6 address (expands "::"); an embedded IPv4 tail counts as two hextets.
function toIpv6Bucket(address: string): string {
  const [head = '', tail] = address.split('::', 2);
  const toHextets = (part: string | undefined): string[] =>
    part ? part.split(':').flatMap((hextet) => (hextet.includes('.') ? ['0', '0'] : [hextet])) : [];
  const left = toHextets(head);
  const right = toHextets(tail);
  const gap = tail === undefined ? 0 : Math.max(0, IPV6_TOTAL_HEXTETS - left.length - right.length);
  return [...left, ...Array<string>(gap).fill('0'), ...right]
    .slice(0, IPV6_BUCKET_HEXTETS)
    .map((hextet) => hextet.toLowerCase().replace(LEADING_ZEROS_PATTERN, ''))
    .join(':')
    .concat(IPV6_BUCKET_SUFFIX);
}

// The IP ceiling works per bucket: an IPv4 address, or the /64 of an IPv6 address (a single subscriber
// usually owns a whole /64, so rotating inside it must not reset the ceiling).
export function getClientIpBucket(headers: Headers): string {
  for (const name of CLIENT_IP_HEADERS) {
    const first = headers.get(name)?.split(',')[0]?.trim();
    if (!first) continue;
    const mappedIpv4 = IPV4_MAPPED_PATTERN.exec(first)?.[1];
    if (mappedIpv4) return mappedIpv4;
    const address = first.replace(IPV6_DECORATION_PATTERN, '');
    return address.includes(':') ? toIpv6Bucket(address) : address;
  }
  return UNKNOWN_CLIENT_IP;
}
