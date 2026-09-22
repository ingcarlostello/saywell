import * as z from 'zod';
import { jsonResponse } from './_lib/http.utils.js';

// Platform spike: proves Vercel compiles api/ with NodeNext + relative `.js` imports + npm deps.
const spikeBodySchema = z.object({ word: z.string().trim().min(1).max(50) });

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return jsonResponse(405, { error: 'method_not_allowed' }, { Allow: 'POST' });
    const parsed = spikeBodySchema.safeParse(await request.json().catch(() => undefined));
    if (!parsed.success) return jsonResponse(400, { error: 'invalid_body' });
    return jsonResponse(200, { spike: true, word: parsed.data.word });
  },
};
