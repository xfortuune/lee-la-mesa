// How each combo of a range connects with the board: made hand (one per combo) and draws
// (any number per combo), plus the weighted statistics of the whole range.
import { type Card, RANKS, SUITS } from '../cards';
import { cardToInt, evaluate } from '../equity';
import { type ComboKey, type LiveCombo, type Range, liveCombos, rangeSize } from './combos';

/** Made-hand categories, best first. Each combo counts in exactly one. */
export const MADE_CATEGORIES = [
  'straight_flush',
  'quads',
  'full_house',
  'flush',
  'straight',
  'set',
  'trips',
  'two_pair',
  'overpair',
  'top_pair_good',
  'top_pair_medium',
  'top_pair_weak',
  'pp_between',
  'middle_pair',
  'pp_below',
  'low_pair',
  'ace_high',
  'nothing',
] as const;
export type MadeCategory = (typeof MADE_CATEGORIES)[number];

/** Draw categories. A combo can have several, on top of its made hand. */
export const DRAW_CATEGORIES = [
  'combo_draw',
  'flush_draw',
  'nut_flush_draw',
  'oesd',
  'gutshot',
  'backdoor_flush',
  'backdoor_straight',
  'overcards',
] as const;
export type DrawCategory = (typeof DRAW_CATEGORIES)[number];

export type Category = MadeCategory | DrawCategory;

export interface ComboClass {
  made: MadeCategory;
  /** The flush (made) is the best possible flush on this board. */
  nutFlush: boolean;
  draws: DrawCategory[];
}

const SCORE_BASE = 16 ** 5;
const CAT_STRAIGHT = 4;
const CAT_QUADS = 7;
const BY_SCORE_CATEGORY: Record<number, MadeCategory> = {
  4: 'straight',
  5: 'flush',
  6: 'full_house',
  7: 'quads',
  8: 'straight_flush',
};
const RANKS_DESC = [...RANKS].reverse();

function rankCounts(cards: Card[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const c of cards) m.set(c.rank, (m.get(c.rank) ?? 0) + 1);
  return m;
}

/** Top-pair kicker class: best two available kickers are "good", the next three "medium". */
export function kickerClass(pairRank: number, kicker: number, boardRanks: number[]): 'good' | 'medium' | 'weak' {
  const ladder = RANKS_DESC.filter((r) => r !== pairRank && !boardRanks.includes(r));
  const i = ladder.indexOf(kicker);
  return i < 2 ? 'good' : i < 5 ? 'medium' : 'weak';
}

/** Pair-level reading (below a straight), ignoring a pair or trips that is only on the board. */
function pairLevel(hole: [Card, Card], board: Card[]): MadeCategory {
  const counts = rankCounts(board);
  const D = [...counts.keys()].sort((a, b) => b - a);
  const [h1, h2] = [hole[0].rank, hole[1].rank].sort((a, b) => b - a);
  const boardPaired = [...counts.values()].some((n) => n >= 2);

  if (h1 === h2) {
    if (counts.has(h1)) return 'set';
    if (h1 > D[0]) return 'overpair';
    // Below the top card but above the lowest one (QQ on A-K-7).
    if (D.length > 1 && h1 > D[D.length - 1]) return 'pp_between';
    return 'pp_below';
  }
  if (counts.get(h1) === 2 || counts.get(h2) === 2) return 'trips';
  const m1 = counts.has(h1);
  const m2 = counts.has(h2);
  if (m1 && m2) return 'two_pair';
  // One of our cards paired plus the board's own pair is two pair as well.
  if ((m1 || m2) && boardPaired) return 'two_pair';
  if (m1 || m2) {
    const rank = m1 ? h1 : h2;
    const idx = D.indexOf(rank);
    if (idx === 0) return `top_pair_${kickerClass(rank, m1 ? h2 : h1, D)}` as MadeCategory;
    return idx === 1 ? 'middle_pair' : 'low_pair';
  }
  return h1 === 14 ? 'ace_high' : 'nothing';
}

/** Ranks that complete a straight using at least one of our cards (aces also count as 1). */
function straightOuts(hole: [Card, Card], board: Card[]): { outs: Set<number>; backdoor: boolean } {
  const withLowAce = (r: number) => (r === 14 ? [14, 1] : [r]);
  const all = new Set([...hole, ...board].flatMap((c) => withLowAce(c.rank)));
  const boardRanks = new Set(board.flatMap((c) => withLowAce(c.rank)));
  const ours = new Set(hole.flatMap((c) => withLowAce(c.rank)).filter((r) => !boardRanks.has(r)));
  const outs = new Set<number>();
  let backdoor = false;
  for (let low = 1; low <= 10; low++) {
    const window = [low, low + 1, low + 2, low + 3, low + 4];
    if (!window.some((r) => ours.has(r))) continue;
    const missing = window.filter((r) => !all.has(r));
    if (missing.length === 1) outs.add(missing[0] === 1 ? 14 : missing[0]);
    if (missing.length === 2) backdoor = true;
  }
  return { outs, backdoor };
}

export function classifyCombo(hole: [Card, Card], board: Card[]): ComboClass {
  const all = [...hole, ...board];
  const score = evaluate(all.map(cardToInt));
  const cat = Math.floor(score / SCORE_BASE);
  const boardScore = board.length >= 5 ? evaluate(board.map(cardToInt)) : -1;
  const boardQuads = [...rankCounts(board).values()].includes(4);

  // Straight or better counts only if it beats what the board alone already makes.
  const strong = cat >= CAT_STRAIGHT && score > boardScore && !(cat === CAT_QUADS && boardQuads);
  const made: MadeCategory = strong ? BY_SCORE_CATEGORY[cat] : pairLevel(hole, board);

  let nutFlush = false;
  const draws: DrawCategory[] = [];
  const flushMade = made === 'flush' || made === 'straight_flush';

  for (const suit of SUITS) {
    const total = all.filter((c) => c.suit === suit).length;
    const ours = hole.filter((c) => c.suit === suit);
    if (!ours.length) continue;
    // The nut card of the suit: the highest rank of that suit not on the board.
    const nutRank = RANKS_DESC.find((r) => !board.some((c) => c.suit === suit && c.rank === r));
    const holdsNut = ours.some((c) => c.rank === nutRank);
    if (made === 'flush' && total >= 5) nutFlush = holdsNut;
    if (board.length < 5 && !flushMade && total === 4) {
      draws.push('flush_draw');
      if (holdsNut) draws.push('nut_flush_draw');
    }
  }

  if (board.length < 5) {
    const hasStraight = made === 'straight' || made === 'straight_flush';
    const { outs, backdoor } = straightOuts(hole, board);
    const hasFD = draws.includes('flush_draw');
    let straightDraw = false;
    if (!hasStraight && outs.size >= 2) {
      draws.push('oesd'); // includes double gutshots
      straightDraw = true;
    } else if (!hasStraight && outs.size === 1) {
      draws.push('gutshot');
      straightDraw = true;
    }
    if (hasFD && straightDraw) draws.unshift('combo_draw');

    if (board.length === 3) {
      if (!hasFD && !flushMade) {
        const bdfd = SUITS.some(
          (s) => all.filter((c) => c.suit === s).length === 3 && hole.some((c) => c.suit === s),
        );
        if (bdfd) draws.push('backdoor_flush');
      }
      if (!straightDraw && !hasStraight && backdoor) draws.push('backdoor_straight');
    }

    const maxBoard = Math.max(...board.map((c) => c.rank));
    if ((made === 'ace_high' || made === 'nothing') && Math.min(hole[0].rank, hole[1].rank) > maxBoard)
      draws.push('overcards');
  }

  return { made, nutFlush, draws };
}

// ---------------------------------------------------------------------------
// Range statistics

export interface CategoryStat {
  /** Weighted combos in the category. */
  weight: number;
  combos: ComboKey[];
}

export type DistributionGroup = 'strong' | 'medium' | 'draws' | 'air';

const STRONG = new Set<MadeCategory>([
  'straight_flush',
  'quads',
  'full_house',
  'flush',
  'straight',
  'set',
  'trips',
  'two_pair',
  'overpair',
]);
const MEDIUM = new Set<MadeCategory>(['top_pair_good', 'top_pair_medium', 'top_pair_weak', 'pp_between', 'middle_pair']);
const REAL_DRAWS: DrawCategory[] = ['flush_draw', 'oesd', 'gutshot'];

/** Distribution group of a combo: strong / medium made hands, otherwise draw or air. */
export function groupOf(c: ComboClass): DistributionGroup {
  if (STRONG.has(c.made)) return 'strong';
  if (MEDIUM.has(c.made)) return 'medium';
  return c.draws.some((d) => REAL_DRAWS.includes(d)) ? 'draws' : 'air';
}

/** Made categories counted as "top pair or better". */
export const TOP_PAIR_OR_BETTER = new Set<MadeCategory>(
  MADE_CATEGORIES.slice(0, MADE_CATEGORIES.indexOf('top_pair_weak') + 1),
);

export interface RangeAnalysis {
  /** Weighted combos of the range before removing dead cards. */
  totalAll: number;
  /** Weighted live combos (after board and Hero's cards). */
  total: number;
  live: LiveCombo[];
  classes: Map<ComboKey, ComboClass>;
  made: Record<MadeCategory, CategoryStat>;
  draws: Record<DrawCategory, CategoryStat>;
  /** Weighted combos holding the nut flush (part of "flush"). */
  nutFlush: number;
  groups: Record<DistributionGroup, number>;
}

const empty = <K extends string>(keys: readonly K[]) =>
  Object.fromEntries(keys.map((k) => [k, { weight: 0, combos: [] as ComboKey[] }])) as Record<K, CategoryStat>;

/** Classifies every live combo of the range on a board of 3 to 5 cards. */
export function analyzeRange(range: Range, board: Card[], hero: Card[] = []): RangeAnalysis {
  const live = liveCombos(range, [...board, ...hero]);
  const made = empty(MADE_CATEGORIES);
  const draws = empty(DRAW_CATEGORIES);
  const groups: Record<DistributionGroup, number> = { strong: 0, medium: 0, draws: 0, air: 0 };
  const classes = new Map<ComboKey, ComboClass>();
  let total = 0;
  let nutFlush = 0;

  for (const c of live) {
    total += c.weight;
    if (board.length < 3) continue;
    const cls = classifyCombo(c.cards, board);
    classes.set(c.key, cls);
    made[cls.made].weight += c.weight;
    made[cls.made].combos.push(c.key);
    if (cls.nutFlush) nutFlush += c.weight;
    for (const d of cls.draws) {
      draws[d].weight += c.weight;
      draws[d].combos.push(c.key);
    }
    groups[groupOf(cls)] += c.weight;
  }

  return { totalAll: rangeSize(range), total, live, classes, made, draws, nutFlush, groups };
}

/** Keeps (or removes) the live combos of an analysed range that fall in any of the given categories. */
export function filterRange(
  analysis: RangeAnalysis,
  categories: Category[],
  mode: 'keep' | 'remove',
): Range {
  const hit = new Set<ComboKey>();
  for (const cat of categories) {
    const stat = (analysis.made as Record<string, CategoryStat>)[cat] ?? (analysis.draws as Record<string, CategoryStat>)[cat];
    stat?.combos.forEach((k) => hit.add(k));
  }
  const next: Range = {};
  for (const c of analysis.live) {
    if (hit.has(c.key) === (mode === 'keep')) next[c.key] = c.weight;
  }
  return next;
}
