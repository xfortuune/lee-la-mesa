// PokerToolBox review API (Cloudflare Worker).
// POST /review with { hand, equities, lang } → streams the AI review as plain text.
import Anthropic from '@anthropic-ai/sdk';
import { InvalidRequest, SYSTEM_PROMPT, buildUserPrompt, cacheKey, parseReviewRequest } from './review';

export interface Env {
  ANTHROPIC_API_KEY: string;
  /** KV namespace for rate limits and cached reviews. */
  RATE: KVNamespace;
  ALLOWED_ORIGINS: string;
  MODEL: string;
  DAILY_LIMIT_PER_IP: string;
  DAILY_LIMIT_TOTAL: string;
}

const DAY = 24 * 60 * 60;
const CACHE_TTL = 30 * DAY;

function cors(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
  return origin && allowed.includes(origin)
    ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Expose-Headers': 'X-Review-Cache',
        Vary: 'Origin',
      }
    : {};
}

function json(status: number, body: unknown, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}

/** Counts one request against a daily KV counter; returns false once the limit is reached. */
async function underLimit(env: Env, key: string, limit: number): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const k = `limit:${day}:${key}`;
  const used = Number((await env.RATE.get(k)) ?? 0);
  if (used >= limit) return false;
  await env.RATE.put(k, String(used + 1), { expirationTtl: 2 * DAY });
  return true;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = request.headers.get('Origin');
    const headers = cors(origin, env);
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (url.pathname !== '/review' || request.method !== 'POST') return json(404, { error: 'not_found' }, headers);
    if (!headers['Access-Control-Allow-Origin']) return json(403, { error: 'origin_not_allowed' }, headers);

    let review;
    try {
      review = parseReviewRequest(await request.json());
    } catch (e) {
      const message = e instanceof InvalidRequest ? e.message : 'invalid JSON';
      return json(400, { error: 'invalid_request', message }, headers);
    }

    const prompt = buildUserPrompt(review);
    const key = await cacheKey(prompt, env.MODEL);
    const cached = await env.RATE.get(key);
    if (cached) {
      return new Response(cached, {
        headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8', 'X-Review-Cache': 'hit' },
      });
    }

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (!(await underLimit(env, `ip:${ip}`, Number(env.DAILY_LIMIT_PER_IP)))) {
      return json(429, { error: 'rate_limited', scope: 'user' }, headers);
    }
    if (!(await underLimit(env, 'total', Number(env.DAILY_LIMIT_TOTAL)))) {
      return json(429, { error: 'rate_limited', scope: 'global' }, headers);
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const stream = client.beta.messages.stream({
      model: env.MODEL,
      // A deliberate cost cap: the review is asked to stay under 450 words.
      max_tokens: 8000,
      output_config: { effort: 'medium' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        let text = '';
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              text += event.delta.text;
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          const final = await stream.finalMessage();
          if (final.stop_reason === 'refusal') {
            controller.enqueue(encoder.encode('\n\n[[refusal]]'));
          } else if (text.trim()) {
            // Only complete answers are cached.
            ctx.waitUntil(env.RATE.put(key, text, { expirationTtl: CACHE_TTL }));
          }
        } catch (e) {
          const status = e instanceof Anthropic.APIError ? e.status : 'network';
          console.error('review failed', status);
          controller.enqueue(encoder.encode('\n\n[[error]]'));
        } finally {
          controller.close();
        }
      },
      cancel() {
        stream.abort();
      },
    });

    return new Response(body, {
      headers: { ...headers, 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Review-Cache': 'miss' },
    });
  },
};
