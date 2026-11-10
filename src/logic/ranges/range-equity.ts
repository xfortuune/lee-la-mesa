// Equity against a weighted range: Hero's hand vs the range, or the range vs a random hand.
import { type Card, fullDeck } from '../cards';
import { cardToInt, evaluate } from '../equity';
import { type MadeCategory, classifyCombo } from './classify';
import { type Range, liveCombos } from './combos';

export interface RangeEquityResult {
  /** Hero's equity vs the range, or the range's equity vs a random hand (0..1). */
  equity: number;
  /** Same, split by the made-hand category of the range's combos on the current board. */
  byMade: Partial<Record<MadeCategory, { equity: number; weight: number }>>;
  method: 'exact' | 'monte_carlo';
  samples: number;
}

export interface RangeEquityOptions {
  hero: Card[] | null;
  range: Range;
  board: Card[];
  samples?: number;
  random?: () => number;
  /** Force Monte Carlo even where an exact count is possible (used for big tables). */
  forceMonteCarlo?: boolean;
}

const DEFAULT_SAMPLES = 20_000;

/** Share of the pot won by `a` against `b` (1, 0.5 or 0). */
const share = (a: number, b: number) => (a > b ? 1 : a === b ? 0.5 : 0);

export function rangeEquity(opts: RangeEquityOptions): RangeEquityResult | null {
  const { hero, range, board } = opts;
  const dead = [...board, ...(hero ?? [])];
  const combos = liveCombos(range, dead);
  if (!combos.length) return null;

  const boardInts = board.map(cardToInt);
  const deadInts = new Set(dead.map(cardToInt));
  const deck = fullDeck().map(cardToInt).filter((c) => !deadInts.has(c));
  const category = (cards: [Card, Card]) => (board.length >= 3 ? classifyCombo(cards, board).made : null);

  // Accumulators: total and per category (from the hero's point of view, or the range's).
  let sum = 0;
  let weightSum = 0;
  const cat = new Map<MadeCategory, { sum: number; weight: number }>();
  const add = (c: MadeCategory | null, value: number, w: number) => {
    sum += value * w;
    weightSum += w;
    if (!c) return;
    const e = cat.get(c) ?? { sum: 0, weight: 0 };
    e.sum += value * w;
    e.weight += w;
    cat.set(c, e);
  };

  let method: RangeEquityResult['method'] = 'monte_carlo';
  let samples = 0;
  const heroInts = hero?.map(cardToInt) ?? null;

  if (heroInts && board.length >= 4 && !opts.forceMonteCarlo) {
    // Exact: every combo of the range, and every river when on the turn.
    method = 'exact';
    for (const c of combos) {
      const v = c.cards.map(cardToInt);
      const rivers = board.length === 5 ? [null] : deck.filter((x) => x !== v[0] && x !== v[1]);
      let s = 0;
      for (const r of rivers) {
        const b = r === null ? boardInts : [...boardInts, r];
        s += share(evaluate([...heroInts, ...b]), evaluate([...v, ...b]));
      }
      add(category(c.cards), s / rivers.length, c.weight);
      samples += rivers.length;
    }
  } else {
    // Monte Carlo: pick a combo by weight, then deal what is missing.
    const random = opts.random ?? Math.random;
    const target = opts.samples ?? DEFAULT_SAMPLES;
    const cumulative: number[] = [];
    let acc = 0;
    for (const c of combos) cumulative.push((acc += c.weight));
    const cats = combos.map((c) => category(c.cards));
    const ints = combos.map((c) => c.cards.map(cardToInt));
    const missing = 5 - board.length;
    const used = new Set<number>();
    const draw = () => {
      for (;;) {
        const x = deck[Math.floor(random() * deck.length)];
        if (!used.has(x)) {
          used.add(x);
          return x;
        }
      }
    };

    for (; samples < target; samples++) {
      const pick = random() * acc;
      let lo = 0;
      let hi = cumulative.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cumulative[mid] > pick) hi = mid;
        else lo = mid + 1;
      }
      const v = ints[lo];
      used.clear();
      used.add(v[0]);
      used.add(v[1]);
      const opp = heroInts ?? [draw(), draw()];
      const b = [...boardInts];
      for (let i = 0; i < missing; i++) b.push(draw());
      const mine = evaluate([...opp, ...b]);
      const theirs = evaluate([...v, ...b]);
      // With a Hero: Hero's share. Without: the range's share vs the random hand.
      const value = heroInts ? share(mine, theirs) : share(theirs, mine);
      // Each sample stands for one combo draw, so it counts with weight 1.
      add(cats[lo], value, 1);
    }
  }

  const byMade: RangeEquityResult['byMade'] = {};
  for (const [c, e] of cat) byMade[c] = { equity: e.sum / e.weight, weight: e.weight };
  return { equity: sum / weightSum, byMade, method, samples };
}
