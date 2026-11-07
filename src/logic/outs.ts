// Outs: cards that improve your hand if they come on the next street.
import type { Lang } from '../i18n/lang';
import { type Card, cardsToString, fullDeck, joinList, parseCards, shuffle } from './cards';
import { HAND_CATEGORIES, HAND_LABELS, type HandCategory, cardToInt, categoryOf, evaluate } from './equity';

const CAT = Object.fromEntries(HAND_CATEGORIES.map((c, i) => [c, i])) as Record<HandCategory, number>;

/** Why a card is an out (best to worst). */
export type OutReason = HandCategory | 'top_pair';

export interface OutGroup {
  reason: OutReason;
  cards: Card[];
}

export type Street = 'flop' | 'turn';

export interface OutsResult {
  street: Street;
  /** Your current hand. */
  current: HandCategory;
  outs: Card[];
  /** Outs grouped by the hand they make (each card in one group only). */
  groups: OutGroup[];
  /** Cards still to come (47 on the flop, 46 on the turn). */
  unseen: number;
  /** Rule multiplier: 4 on the flop (two cards to come), 2 on the turn. */
  factor: 2 | 4;
  /** Rule-of-2-and-4 estimate, in %. */
  estimate: number;
  /** Exact probability of hitting at least one out by the river, in %. */
  exact: number;
  reason: string;
}

const REASON_ORDER: OutReason[] = [
  'straight_flush',
  'quads',
  'full_house',
  'flush',
  'straight',
  'trips',
  'two_pair',
  'top_pair',
];

const cat = (cards: Card[]) => categoryOf(evaluate(cards.map(cardToInt)));

/** Why is `card` an out? null when it is not one. */
export function outReason(hole: Card[], board: Card[], card: Card): OutReason | null {
  const now = CAT[cat([...hole, ...board])];
  const next = CAT[cat([...hole, ...board, card])];
  const boardOnly = CAT[cat([...board, card])];
  // It must improve your hand and beat what the board alone would give.
  if (next <= now || next <= boardOnly) return null;

  if (next >= CAT.straight) return HAND_CATEGORIES[next];
  if (next === CAT.pair) {
    // Only pairing an overcard counts (one of your cards above the whole board).
    const topBoard = Math.max(...board.map((c) => c.rank));
    const paired = hole.find((h) => h.rank === card.rank);
    return paired && paired.rank > topBoard ? 'top_pair' : null;
  }
  // Two pair or trips: the card must pair one of yours
  // (if it only pairs the board, it improves everyone equally).
  return hole.some((h) => h.rank === card.rank) ? HAND_CATEGORIES[next] : null;
}

function binom2(n: number): number {
  return (n * (n - 1)) / 2;
}

function describeGroup(g: OutGroup, lang: Lang): string {
  const n = g.cards.length;
  return `${HAND_LABELS[lang][g.reason].toLowerCase()} (${n} out${n === 1 ? '' : 's'}: ${cardsToString(g.cards)})`;
}

/** Counts the outs. `lang` only affects the wording of the explanation. */
export function computeOuts(hole: Card[], board: Card[], lang: Lang = 'en'): OutsResult {
  if (hole.length !== 2) throw new Error('Two hole cards are required.');
  if (board.length !== 3 && board.length !== 4) throw new Error('The board must have 3 (flop) or 4 (turn) cards.');

  const street: Street = board.length === 3 ? 'flop' : 'turn';
  const known = new Set([...hole, ...board].map(cardToInt));
  const unseenCards = fullDeck().filter((c) => !known.has(cardToInt(c)));
  const byReason = new Map<OutReason, Card[]>();
  for (const c of unseenCards) {
    const r = outReason(hole, board, c);
    if (r) byReason.set(r, [...(byReason.get(r) ?? []), c]);
  }
  const groups = REASON_ORDER.filter((r) => byReason.has(r)).map((reason) => ({
    reason,
    cards: byReason.get(reason)!.sort((a, b) => b.rank - a.rank),
  }));
  const outs = groups.flatMap((g) => g.cards);
  const n = outs.length;
  const unseen = unseenCards.length;
  const factor = street === 'flop' ? 4 : 2;
  const exact = street === 'flop' ? (1 - binom2(unseen - n) / binom2(unseen)) * 100 : (n / unseen) * 100;
  const current = cat([...hole, ...board]);

  const now = HAND_LABELS[lang][current].toLowerCase();
  const list = joinList(
    groups.map((g) => describeGroup(g, lang)),
    lang,
  );
  const reason =
    lang === 'en'
      ? n === 0
        ? `You currently have ${now} and no card improves you.`
        : `You currently have ${now}. ${n} cards improve you: ${list}.`
      : n === 0
        ? `Ahora tienes ${now} y ninguna carta te hace mejorar.`
        : `Ahora tienes ${now}. Te mejoran ${n} cartas: ${list}.`;

  return { street, current, outs, groups, unseen, factor, estimate: n * factor, exact, reason };
}

/** The rule as text: "Rule of 4: 9 outs × 4 = 36%". */
export function ruleText(r: OutsResult, lang: Lang = 'en'): string {
  return lang === 'en'
    ? `Rule of ${r.factor}: ${r.outs.length} outs × ${r.factor} = ${r.estimate}%`
    : `Regla del ${r.factor}: ${r.outs.length} outs × ${r.factor} = ${r.estimate} %`;
}

/** Percentage options for the question (the correct one + 3 distractors), sorted. */
export function percentOptions(r: OutsResult, random: () => number = Math.random): number[] {
  const n = r.outs.length;
  const other = r.factor === 4 ? 2 : 4;
  const candidates = [
    n * other,
    (n + 2) * r.factor,
    (n - 2) * r.factor,
    (n + 1) * r.factor,
    (n - 1) * r.factor,
    (n + 3) * r.factor,
  ].filter((v) => v > 0 && v !== r.estimate && v <= 100);
  const unique = [...new Set(candidates)];
  const picked = shuffle(unique, random).slice(0, 3);
  return [r.estimate, ...picked].sort((a, b) => a - b);
}

export interface OutsDeal {
  hole: Card[];
  board: Card[];
}

function isPaired(cards: Card[]): boolean {
  return new Set(cards.map((c) => c.rank)).size < cards.length;
}

/**
 * Deals a training spot: flop or turn (50/50), unpaired board, no straight or better yet,
 * and at least two outs. 70% of the time the spot has a draw (flush or straight).
 */
export function dealOuts(random: () => number = Math.random): OutsDeal {
  const street: Street = random() < 0.5 ? 'flop' : 'turn';
  const wantDraw = random() < 0.7;
  for (let i = 0; i < 5000; i++) {
    const deck = shuffle(fullDeck(), random);
    const hole = deck.slice(0, 2);
    const board = deck.slice(2, street === 'flop' ? 5 : 6);
    if (isPaired(board)) continue;
    if (CAT[cat([...hole, ...board])] >= CAT.straight) continue;
    const r = computeOuts(hole, board);
    if (r.outs.length < 2) continue;
    const hasDraw = r.groups.some((g) => g.reason !== 'top_pair' && CAT[g.reason] >= CAT.straight);
    if (hasDraw !== wantDraw) continue;
    return { hole, board };
  }
  return { hole: parseCards('A♥K♥'), board: parseCards('Q♥7♥2♣') };
}
