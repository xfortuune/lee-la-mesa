// Turn and river tables: how every possible next card changes the range.
import { type Card, fullDeck } from '../cards';
import { cardToInt } from '../equity';
import { type RangeAnalysis, TOP_PAIR_OR_BETTER, analyzeRange } from './classify';
import type { Range } from './combos';
import { rangeEquity } from './range-equity';

export interface NextCardRow {
  card: Card;
  /** Share of the live range with top pair or better after this card (0..1). */
  topPairPlus: number;
  /** Share of the live range with a flush draw, an open-ender or a gutshot (0..1). */
  draws: number;
  /** Change versus the current board (in shares). */
  deltaTopPairPlus: number;
  deltaDraws: number;
  /** Hero's equity vs the range after this card, if there is a Hero. */
  equity: number | null;
}

export function topPairPlusShare(a: RangeAnalysis): number {
  if (!a.total) return 0;
  let w = 0;
  for (const cat of TOP_PAIR_OR_BETTER) w += a.made[cat].weight;
  return w / a.total;
}

export function drawShare(a: RangeAnalysis): number {
  if (!a.total) return 0;
  let w = 0;
  for (const c of a.live) {
    const cls = a.classes.get(c.key);
    if (cls?.draws.some((d) => d === 'flush_draw' || d === 'oesd' || d === 'gutshot')) w += c.weight;
  }
  return w / a.total;
}

/**
 * One row per possible next card (turn when the board has 3 cards, river when it has 4),
 * excluding the board and Hero's cards. Rows are in deck order; the UI sorts them.
 */
export function nextCardTable(
  range: Range,
  board: Card[],
  hero: Card[] | null,
  options: { equitySamples?: number } = {},
): NextCardRow[] {
  if (board.length !== 3 && board.length !== 4) return [];
  const heroCards = hero ?? [];
  const current = analyzeRange(range, board, heroCards);
  const baseTop = topPairPlusShare(current);
  const baseDraws = drawShare(current);
  const dead = new Set([...board, ...heroCards].map(cardToInt));

  return fullDeck()
    .filter((c) => !dead.has(cardToInt(c)))
    .map((card) => {
      const next = [...board, card];
      const a = analyzeRange(range, next, heroCards);
      const top = topPairPlusShare(a);
      const dr = drawShare(a);
      const eq =
        hero && hero.length === 2
          ? (rangeEquity({
              hero,
              range,
              board: next,
              samples: options.equitySamples ?? 2_000,
              forceMonteCarlo: next.length < 5,
            })?.equity ?? null)
          : null;
      return { card, topPairPlus: top, draws: dr, deltaTopPairPlus: top - baseTop, deltaDraws: dr - baseDraws, equity: eq };
    });
}
