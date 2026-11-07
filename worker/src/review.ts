// Pure helpers of the review API: request validation and prompt assembly.
// The prompt is always built here from a validated hand, never taken from the client,
// so the endpoint cannot be used as a general-purpose AI proxy.
import type { Lang } from '../../src/i18n/lang';
import { SUITS, type Card } from '../../src/logic/cards';
import { analyzeHand, buildReviewPrompt } from '../../src/logic/hand-analysis';
import type { ActionType, HandAction, HandHistory, Seat, Street } from '../../src/logic/hand-history';

export interface ReviewRequest {
  hand: HandHistory;
  /** Equity per Hero decision, computed in the browser (the Worker has little CPU time). */
  equities: { vsRandom: number | null; vsShown: number | null }[];
  lang: Lang;
}

export class InvalidRequest extends Error {}

const STREETS: Street[] = ['preflop', 'flop', 'turn', 'river'];
const ACTION_TYPES: ActionType[] = ['post_sb', 'post_bb', 'post_ante', 'post', 'fold', 'check', 'call', 'bet', 'raise'];
const CURRENCIES = ['€', '$', '£', ''];
const MAX_PLAYERS = 10;
const MAX_ACTIONS = 200;
const MAX_NAME = 64;

function fail(msg: string): never {
  throw new InvalidRequest(msg);
}

function num(v: unknown, field: string, min = 0, max = 1e7): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) fail(`invalid ${field}`);
  return v;
}

function str(v: unknown, field: string, max = MAX_NAME): string {
  if (typeof v !== 'string' || v.length > max) fail(`invalid ${field}`);
  return v;
}

function card(v: unknown): Card {
  const c = v as Card;
  if (!c || !Number.isInteger(c.rank) || c.rank < 2 || c.rank > 14 || !SUITS.includes(c.suit)) fail('invalid card');
  return { rank: c.rank, suit: c.suit };
}

function cards(v: unknown, maxLen: number): Card[] {
  if (!Array.isArray(v) || v.length > maxLen) fail('invalid cards');
  return v.map(card);
}

function prob(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  return num(v, 'equity', 0, 1);
}

/** Validates the request body and rebuilds a clean HandHistory (only known fields survive). */
export function parseReviewRequest(body: unknown): ReviewRequest {
  if (!body || typeof body !== 'object') fail('body must be an object');
  const b = body as Record<string, unknown>;
  const lang: Lang = b.lang === 'es' ? 'es' : 'en';
  const h = b.hand as Record<string, unknown>;
  if (!h || typeof h !== 'object') fail('missing hand');
  if (h.cash !== true) fail('only cash games');

  if (!Array.isArray(h.players) || h.players.length < 2 || h.players.length > MAX_PLAYERS) fail('invalid players');
  const players: Seat[] = h.players.map((p: Record<string, unknown>) => ({
    seat: num(p?.seat, 'seat', 1, 20),
    name: str(p?.name, 'player name'),
    stack: num(p?.stack, 'stack'),
  }));
  const names = new Set(players.map((p) => p.name));
  if (names.size !== players.length) fail('duplicate players');

  if (!Array.isArray(h.actions) || h.actions.length > MAX_ACTIONS) fail('invalid actions');
  const actions: HandAction[] = h.actions.map((a: Record<string, unknown>) => {
    const street = a?.street as Street;
    const type = a?.type as ActionType;
    const player = str(a?.player, 'action player');
    if (!STREETS.includes(street) || !ACTION_TYPES.includes(type) || !names.has(player)) fail('invalid action');
    return {
      street,
      player,
      type,
      amount: num(a.amount, 'amount'),
      total: num(a.total, 'total'),
      allIn: a.allIn === true,
    };
  });

  const hero = h.hero === null ? null : str(h.hero, 'hero');
  if (hero !== null && !names.has(hero)) fail('unknown hero');
  const currency = typeof h.currency === 'string' && CURRENCIES.includes(h.currency) ? h.currency : '€';

  const hand: HandHistory = {
    site: 'winamax',
    handId: str(h.handId ?? '', 'handId', 80),
    table: '', // not used in the prompt
    cash: true,
    sb: num(h.sb, 'sb', 0.0001),
    bb: num(h.bb, 'bb', 0.0001),
    currency,
    maxSeats: num(h.maxSeats, 'maxSeats', 2, MAX_PLAYERS),
    buttonSeat: num(h.buttonSeat, 'buttonSeat', 0, 20),
    players,
    hero,
    heroCards: h.heroCards === null ? null : cards(h.heroCards, 2),
    actions,
    board: cards(h.board, 5),
    showdown: Array.isArray(h.showdown)
      ? h.showdown.slice(0, MAX_PLAYERS).map((s: Record<string, unknown>) => {
          const player = str(s?.player, 'showdown player');
          if (!names.has(player)) fail('unknown showdown player');
          return { player, cards: cards(s.cards, 2) };
        })
      : [],
    winners: Array.isArray(h.winners)
      ? h.winners.slice(0, MAX_PLAYERS).map((w: Record<string, unknown>) => {
          const player = str(w?.player, 'winner');
          if (!names.has(player)) fail('unknown winner');
          return { player, amount: num(w.amount, 'winner amount') };
        })
      : [],
    rake: null,
  };
  if (!hand.hero || !hand.heroCards || hand.heroCards.length !== 2) fail('the hand needs Hero and two hole cards');

  const equities = Array.isArray(b.equities)
    ? b.equities.slice(0, MAX_ACTIONS).map((e: Record<string, unknown>) => ({ vsRandom: prob(e?.vsRandom), vsShown: prob(e?.vsShown) }))
    : [];

  return { hand, equities, lang };
}

export const SYSTEM_PROMPT = `You are PokerToolBox's hand-review coach: an expert No-Limit Hold'em cash game player who explains things clearly to beginner and intermediate players.

You receive one hand with numbers computed by the site (pot odds, SPR, equity). Use them, but think about ranges, positions and stack depth yourself.

Write in the language the user asks for. Use Markdown with this structure and nothing before it:
### Verdict
One or two sentences, then "Score: N/10".
### Street by street
For each of Hero's decisions: the action, a label (Good / Questionable / Mistake in English; Buena / Dudosa / Error in Spanish) and a short explanation.
### What to do instead
Only where a decision could improve: the better line with bet sizes.
### Key takeaway
One practical lesson.

Judge decisions, not results: never use the cards revealed at showdown to grade a decision. Keep it under 450 words. If the hand data looks inconsistent, say so briefly and review what you can.`;

/** Builds the user message for the model from a validated request. */
export function buildUserPrompt({ hand, equities, lang }: ReviewRequest): string {
  const analysis = analyzeHand(hand, { equity: false });
  analysis.decisions.forEach((d, i) => {
    d.equityVsRandom = equities[i]?.vsRandom ?? null;
    d.equityVsShown = equities[i]?.vsShown ?? null;
  });
  return buildReviewPrompt(hand, analysis, lang);
}

/** Cache key for a review: same hand + language → same answer. */
export async function cacheKey(prompt: string, model: string): Promise<string> {
  const data = new TextEncoder().encode(`${model}\n${SYSTEM_PROMPT}\n${prompt}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return `review:${[...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}
