// Hands (the 169 starting-hand classes), combos (the 1326 concrete two-card hands) and ranges.
import { type Card, RANKS, SUITS, cardToString, rankChar } from '../cards';

/** Ranks from A down to 2 (the order of the 13×13 grid). */
export const RANKS_DESC = [...RANKS].reverse();

/** A starting-hand class: "AA", "AKs" or "AKo". */
export type HandKey = string;

/** A concrete combo, high card first: "A♠K♠". */
export type ComboKey = string;

/**
 * A range: weight (0–1] of each combo in it. Combos not present are not in the range.
 * Weights let a range play a hand only part of the time ("AKo:50").
 */
export type Range = Record<ComboKey, number>;

export interface Combo {
  key: ComboKey;
  hand: HandKey;
  cards: [Card, Card];
}

const byRankThenSuit = (a: Card, b: Card) => b.rank - a.rank || SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);

export function comboKey(a: Card, b: Card): ComboKey {
  const [hi, lo] = [a, b].sort(byRankThenSuit);
  return `${cardToString(hi)}${cardToString(lo)}`;
}

export function handOf(a: Card, b: Card): HandKey {
  const [hi, lo] = [a, b].sort(byRankThenSuit);
  if (hi.rank === lo.rank) return `${rankChar(hi.rank)}${rankChar(lo.rank)}`;
  return `${rankChar(hi.rank)}${rankChar(lo.rank)}${hi.suit === lo.suit ? 's' : 'o'}`;
}

/** Hand key of grid cell (row, col): pairs on the diagonal, suited above it, offsuit below. */
export function gridHand(row: number, col: number): HandKey {
  const a = rankChar(RANKS_DESC[row]);
  const b = rankChar(RANKS_DESC[col]);
  if (row === col) return `${a}${a}`;
  return row < col ? `${a}${b}s` : `${b}${a}o`;
}

/** All 169 hands in grid order (row by row). */
export const ALL_HANDS: HandKey[] = RANKS_DESC.flatMap((_, r) => RANKS_DESC.map((__, c) => gridHand(r, c)));

const RANK_OF: Record<string, number> = Object.fromEntries(RANKS.map((r) => [rankChar(r), r]));

export function handRanks(hand: HandKey): [number, number] {
  return [RANK_OF[hand[0]], RANK_OF[hand[1]]];
}

export function handType(hand: HandKey): 'pair' | 'suited' | 'offsuit' {
  return hand.length === 2 ? 'pair' : hand[2] === 's' ? 'suited' : 'offsuit';
}

const COMBOS_CACHE = new Map<HandKey, Combo[]>();

/** Concrete combos of a hand: 6 for a pair, 4 suited, 12 offsuit. */
export function combosOf(hand: HandKey): Combo[] {
  const cached = COMBOS_CACHE.get(hand);
  if (cached) return cached;
  const [r1, r2] = handRanks(hand);
  const type = handType(hand);
  const out: Combo[] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (type === 'pair' && j <= i) continue;
      if (type === 'suited' && i !== j) continue;
      if (type === 'offsuit' && i === j) continue;
      const a: Card = { rank: r1, suit: SUITS[i] };
      const b: Card = { rank: r2, suit: SUITS[j] };
      out.push({ key: comboKey(a, b), hand, cards: [a, b].sort(byRankThenSuit) as [Card, Card] });
    }
  }
  COMBOS_CACHE.set(hand, out);
  return out;
}

export const ALL_COMBOS: Combo[] = ALL_HANDS.flatMap(combosOf);
export const TOTAL_COMBOS = ALL_COMBOS.length; // 1326

const COMBO_BY_KEY = new Map(ALL_COMBOS.map((c) => [c.key, c]));

export function comboByKey(key: ComboKey): Combo | undefined {
  return COMBO_BY_KEY.get(key);
}

// ---------------------------------------------------------------------------
// Range helpers (all return new objects; ranges are treated as immutable)

export function setHand(range: Range, hand: HandKey, weight: number): Range {
  const next = { ...range };
  for (const c of combosOf(hand)) {
    if (weight > 0) next[c.key] = Math.min(1, weight);
    else delete next[c.key];
  }
  return next;
}

export function setCombos(range: Range, keys: ComboKey[], weight: number): Range {
  const next = { ...range };
  for (const k of keys) {
    if (weight > 0) next[k] = Math.min(1, weight);
    else delete next[k];
  }
  return next;
}

/** Combos of the hand in the range, and their average weight over the hand's combos (0–1). */
export function handFill(range: Range, hand: HandKey): { combos: number; weight: number } {
  const combos = combosOf(hand);
  let n = 0;
  let w = 0;
  for (const c of combos) {
    const cw = range[c.key];
    if (cw) {
      n++;
      w += cw;
    }
  }
  return { combos: n, weight: w / combos.length };
}

export function rangeFromHands(hands: HandKey[], weight = 1): Range {
  return hands.reduce<Range>((r, h) => setHand(r, h, weight), {});
}

export function invertRange(range: Range): Range {
  const next: Range = {};
  for (const c of ALL_COMBOS) if (!range[c.key]) next[c.key] = 1;
  return next;
}

export interface LiveCombo extends Combo {
  weight: number;
}

const cardId = (c: Card) => `${c.rank}${c.suit}`;

/** Combos of the range that do not use any dead card (board or Hero's hand). */
export function liveCombos(range: Range, dead: Card[]): LiveCombo[] {
  const deadIds = new Set(dead.map(cardId));
  const out: LiveCombo[] = [];
  for (const [key, weight] of Object.entries(range)) {
    const c = COMBO_BY_KEY.get(key);
    if (!c || weight <= 0) continue;
    if (deadIds.has(cardId(c.cards[0])) || deadIds.has(cardId(c.cards[1]))) continue;
    out.push({ ...c, weight });
  }
  return out;
}

/** Weighted combo count of a range (optionally after removing dead cards). */
export function rangeSize(range: Range, dead: Card[] = []): number {
  return liveCombos(range, dead).reduce((s, c) => s + c.weight, 0);
}
