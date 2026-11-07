// 5–7 card hand evaluator and equity calculation (probability of winning/tying).
import type { Lang } from '../i18n/lang';
import { type Card, SUITS } from './cards';

// Cards are encoded as integers 0..51: rank = (c >> 2) + 2, suit = c & 3.
export function cardToInt(card: Card): number {
  return ((card.rank - 2) << 2) | SUITS.indexOf(card.suit);
}

export function intToCard(c: number): Card {
  return { rank: (c >> 2) + 2, suit: SUITS[c & 3] };
}

/** Hand categories from worst to best (the index is the category in the score). */
export const HAND_CATEGORIES = [
  'high_card',
  'pair',
  'two_pair',
  'trips',
  'straight',
  'flush',
  'full_house',
  'quads',
  'straight_flush',
] as const;

export type HandCategory = (typeof HAND_CATEGORIES)[number];

/** Display name of each hand (plus "top pair", used by the outs trainer). */
export const HAND_LABELS: Record<Lang, Record<HandCategory | 'top_pair', string>> = {
  en: {
    high_card: 'High card',
    pair: 'Pair',
    two_pair: 'Two pair',
    trips: 'Three of a kind',
    straight: 'Straight',
    flush: 'Flush',
    full_house: 'Full house',
    quads: 'Four of a kind',
    straight_flush: 'Straight flush',
    top_pair: 'Top pair',
  },
  es: {
    high_card: 'Carta alta',
    pair: 'Pareja',
    two_pair: 'Dobles parejas',
    trips: 'Trío',
    straight: 'Escalera',
    flush: 'Color',
    full_house: 'Full',
    quads: 'Póker',
    straight_flush: 'Escalera de color',
    top_pair: 'Pareja máxima',
  },
};

/** Highest rank of a straight inside the rank mask (bit r = rank r), or 0. */
function straightHigh(mask: number): number {
  if (mask & (1 << 14)) mask |= 1 << 1; // ace as 1
  for (let high = 14; high >= 5; high--) {
    const need = 0b11111 << (high - 4);
    if ((mask & need) === need) return high;
  }
  return 0;
}

/** Ranks in the mask from high to low, at most `n`. */
function topRanks(mask: number, n: number): number[] {
  const out: number[] = [];
  for (let r = 14; r >= 2 && out.length < n; r--) if (mask & (1 << r)) out.push(r);
  return out;
}

function pack(category: number, kickers: number[]): number {
  let v = category;
  for (let i = 0; i < 5; i++) v = v * 16 + (kickers[i] ?? 0);
  return v;
}

/** Comparable score (higher = better) of the best 5-card hand among 5–7 cards. */
export function evaluate(cards: number[]): number {
  const counts = new Array<number>(15).fill(0);
  const suitMasks = [0, 0, 0, 0];
  const suitCounts = [0, 0, 0, 0];
  let rankMask = 0;
  for (const c of cards) {
    const r = (c >> 2) + 2;
    const s = c & 3;
    counts[r]++;
    suitMasks[s] |= 1 << r;
    suitCounts[s]++;
    rankMask |= 1 << r;
  }

  // Flush / straight flush
  for (let s = 0; s < 4; s++) {
    if (suitCounts[s] >= 5) {
      const sf = straightHigh(suitMasks[s]);
      if (sf) return pack(8, [sf]);
      // With 7 cards or fewer, a flush cannot coexist with quads or a full house.
      return pack(5, topRanks(suitMasks[s], 5));
    }
  }

  const groups = evaluateGroups(counts, rankMask);
  const st = straightHigh(rankMask);
  if (st) {
    const straight = pack(4, [st]);
    return groups > straight ? groups : straight;
  }
  return groups;
}

/** Best hand ignoring flushes and straights. */
function evaluateGroups(counts: number[], rankMask: number): number {
  const quads: number[] = [];
  const trips: number[] = [];
  const pairs: number[] = [];
  for (let r = 14; r >= 2; r--) {
    if (counts[r] === 4) quads.push(r);
    else if (counts[r] === 3) trips.push(r);
    else if (counts[r] === 2) pairs.push(r);
  }
  const without = (...rs: number[]) => rs.reduce((m, r) => m & ~(1 << r), rankMask);

  if (quads.length) return pack(7, [quads[0], ...topRanks(without(quads[0]), 1)]);
  if (trips.length && (trips.length > 1 || pairs.length)) {
    const pairRank = Math.max(trips[1] ?? 0, pairs[0] ?? 0);
    return pack(6, [trips[0], pairRank]);
  }
  if (trips.length) return pack(3, [trips[0], ...topRanks(without(trips[0]), 2)]);
  if (pairs.length >= 2) return pack(2, [pairs[0], pairs[1], ...topRanks(without(pairs[0], pairs[1]), 1)]);
  if (pairs.length === 1) return pack(1, [pairs[0], ...topRanks(without(pairs[0]), 3)]);
  return pack(0, topRanks(rankMask, 5));
}

export function categoryOf(score: number): HandCategory {
  return HAND_CATEGORIES[Math.floor(score / 16 ** 5)];
}

// ---------------------------------------------------------------------------
// Equity

/** A player's cards: 0, 1 or 2 known (null = unknown/random). */
export type HoleInput = (Card | null)[];

export interface EquityInput {
  players: HoleInput[];
  board: (Card | null)[];
}

export interface PlayerEquity {
  /** Probability of winning outright (0..1). */
  win: number;
  /** Probability of tying (splitting) the pot (0..1). */
  tie: number;
  /** Total equity: wins + the proportional share of ties (0..1). */
  equity: number;
  /** Probability of ending with each hand category (0..1). */
  categories: number[];
}

export interface EquityResult {
  players: PlayerEquity[];
  method: 'exact' | 'monte_carlo';
  samples: number;
}

function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

export const EXACT_LIMIT = 250_000;
export const DEFAULT_SAMPLES = 40_000;

/** Seeded pseudo-random generator (mulberry32) for reproducible test results. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function validateInput(input: EquityInput): string | null {
  if (input.players.length < 2) return 'At least 2 players are needed.';
  const seen = new Set<number>();
  for (const c of [...input.board, ...input.players.flat()]) {
    if (!c) continue;
    const id = cardToInt(c);
    if (seen.has(id)) return 'There are duplicate cards.';
    seen.add(id);
  }
  const boardKnown = input.board.filter(Boolean).length;
  if (boardKnown > 5) return 'The board has at most 5 cards.';
  return null;
}

/**
 * Calculates each player's equity. If every player card is known and few board
 * combinations remain, they are all enumerated (exact); otherwise, Monte Carlo.
 */
export function calculateEquity(
  input: EquityInput,
  options: { samples?: number; random?: () => number } = {},
): EquityResult {
  const error = validateInput(input);
  if (error) throw new Error(error);

  const n = input.players.length;
  const holes = input.players.map((p) => p.filter((c): c is Card => !!c).map(cardToInt));
  const board = input.board.filter((c): c is Card => !!c).map(cardToInt);
  const used = new Set([...board, ...holes.flat()]);
  const deck: number[] = [];
  for (let c = 0; c < 52; c++) if (!used.has(c)) deck.push(c);

  const missingBoard = 5 - board.length;
  const missingHole = holes.map((h) => 2 - h.length);
  const totalMissingHole = missingHole.reduce((a, b) => a + b, 0);

  const wins = new Array<number>(n).fill(0);
  const ties = new Array<number>(n).fill(0);
  const equity = new Array<number>(n).fill(0);
  const cats = Array.from({ length: n }, () => new Array<number>(HAND_CATEGORIES.length).fill(0));
  const scores = new Array<number>(n);
  const seven = holes.map(() => new Array<number>(7));

  const showdown = (fullBoard: number[], fullHoles: number[][]) => {
    let best = -1;
    let winners = 0;
    for (let i = 0; i < n; i++) {
      const h = seven[i];
      h[0] = fullHoles[i][0];
      h[1] = fullHoles[i][1];
      for (let j = 0; j < 5; j++) h[2 + j] = fullBoard[j];
      const s = evaluate(h);
      scores[i] = s;
      cats[i][Math.floor(s / 16 ** 5)]++;
      if (s > best) {
        best = s;
        winners = 1;
      } else if (s === best) winners++;
    }
    for (let i = 0; i < n; i++) {
      if (scores[i] !== best) continue;
      if (winners === 1) wins[i]++;
      else ties[i]++;
      equity[i] += 1 / winners;
    }
  };

  let samples = 0;
  let method: EquityResult['method'];

  if (totalMissingHole === 0 && binom(deck.length, missingBoard) <= EXACT_LIMIT) {
    method = 'exact';
    const fullBoard = [...board, 0, 0, 0, 0, 0].slice(0, 5);
    const rec = (start: number, depth: number) => {
      if (depth === missingBoard) {
        showdown(fullBoard, holes);
        samples++;
        return;
      }
      for (let i = start; i < deck.length; i++) {
        fullBoard[board.length + depth] = deck[i];
        rec(i + 1, depth + 1);
      }
    };
    rec(0, 0);
  } else {
    method = 'monte_carlo';
    const random = options.random ?? Math.random;
    const target = options.samples ?? DEFAULT_SAMPLES;
    const need = missingBoard + totalMissingHole;
    const d = [...deck];
    const fullBoard = new Array<number>(5);
    const fullHoles = holes.map((h) => [h[0] ?? 0, h[1] ?? 0]);
    for (; samples < target; samples++) {
      // Partial Fisher–Yates: only the first `need` positions
      for (let i = 0; i < need; i++) {
        const j = i + Math.floor(random() * (d.length - i));
        const t = d[i];
        d[i] = d[j];
        d[j] = t;
      }
      let k = 0;
      for (let i = 0; i < n; i++) {
        const h = holes[i];
        fullHoles[i][0] = h.length > 0 ? h[0] : d[k++];
        fullHoles[i][1] = h.length > 1 ? h[1] : d[k++];
      }
      for (let j = 0; j < 5; j++) fullBoard[j] = j < board.length ? board[j] : d[k++];
      showdown(fullBoard, fullHoles);
    }
  }

  return {
    method,
    samples,
    players: wins.map((w, i) => ({
      win: w / samples,
      tie: ties[i] / samples,
      equity: equity[i] / samples,
      categories: cats[i].map((c) => c / samples),
    })),
  };
}

/** A player's current hand (with the known cards), if there are at least 5 cards. */
export function currentHand(hole: HoleInput, board: (Card | null)[]): HandCategory | null {
  const cards = [...hole, ...board].filter((c): c is Card => !!c).map(cardToInt);
  if (cards.length < 5 || hole.filter(Boolean).length < 2) return null;
  return categoryOf(evaluate(cards));
}
