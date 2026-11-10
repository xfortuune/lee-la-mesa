import { describe, expect, it } from 'vitest';
import { type Card, parseCards } from '../cards';
import { seededRandom } from '../equity';
import {
  ALL_HANDS,
  MADE_CATEGORIES,
  type Range,
  TOTAL_COMBOS,
  analyzeRange,
  classifyCombo,
  combosOf,
  filterRange,
  formatRange,
  liveCombos,
  nextCardTable,
  parseRange,
  presetRange,
  rangeEquity,
  rangeSize,
  topPairPlusShare,
  drawShare,
  topPercent,
} from '.';

const cards = (t: string) => parseCards(t);
const hole = (t: string) => parseCards(t) as [Card, Card];
const keys = (r: Range) => Object.keys(r).sort();

describe('combos', () => {
  it('counts combos per hand', () => {
    expect(combosOf('AA')).toHaveLength(6);
    expect(combosOf('AKs')).toHaveLength(4);
    expect(combosOf('AKo')).toHaveLength(12);
    expect(rangeSize(parseRange('AK'))).toBe(16);
  });

  it('has 169 hands and 1326 combos', () => {
    expect(ALL_HANDS).toHaveLength(169);
    expect(TOTAL_COMBOS).toBe(1326);
  });
});

describe('notation', () => {
  it('expands TT+', () => {
    expect(keys(parseRange('TT+'))).toEqual(keys(parseRange('TT, JJ, QQ, KK, AA')));
    expect(rangeSize(parseRange('TT+'))).toBe(30);
  });

  it('expands A5s+', () => {
    const r = parseRange('A5s+');
    expect(keys(r)).toEqual(keys(parseRange('A5s, A6s, A7s, A8s, A9s, ATs, AJs, AQs, AKs')));
  });

  it('reads weights', () => {
    const r = parseRange('KQo:50');
    expect(Object.keys(r)).toHaveLength(12);
    expect(Object.values(r).every((w) => w === 0.5)).toBe(true);
  });

  it('reads dashes and single combos', () => {
    expect(rangeSize(parseRange('AA-TT'))).toBe(30);
    expect(rangeSize(parseRange('AKs-ATs'))).toBe(16);
    expect(Object.keys(parseRange('AhKh'))).toEqual(['A♥K♥']);
  });

  it('rejects unknown tokens', () => {
    expect(() => parseRange('AA, XYZ')).toThrow(/XYZ/);
  });

  it('round-trips through text', () => {
    for (const text of [
      'TT+, A5s+, KQo:50',
      'AA-88, AKs-ATs, A5s-A3s, KQo, 76s:25, AhKh, 7c6c',
      'K9o+, 22+, Q8s-Q5s:75',
    ]) {
      const r = parseRange(text);
      expect(parseRange(formatRange(r))).toEqual(r);
    }
    const preset = presetRange('btn');
    expect(parseRange(formatRange(preset))).toEqual(preset);
  });
});

describe('blockers on A♠K♦7♣', () => {
  const board = cards('A♠K♦7♣');

  it('removes dead combos', () => {
    expect(rangeSize(parseRange('AA'), board)).toBe(3);
    expect(rangeSize(parseRange('AK'), board)).toBe(9);
    expect(liveCombos(parseRange('AKs'), board).map((c) => c.key).sort()).toEqual(['A♣K♣', 'A♥K♥']);
    expect(rangeSize(parseRange('AKo'), board)).toBe(7);
  });

  it("removes Hero's cards too", () => {
    expect(rangeSize(parseRange('QQ'), [...board, ...cards('Q♠Q♥')])).toBe(1);
  });
});

describe('made hands on A♠K♦7♣', () => {
  const board = cards('A♠K♦7♣');
  const range = parseRange('AA, KK, 77, AK, AQ, KQ, QQ, T9s');
  const a = analyzeRange(range, board);

  it('classifies the range', () => {
    expect(a.made.set.weight).toBe(9);
    expect(a.made.two_pair.weight).toBe(9);
    const topPair = a.made.top_pair_good.weight + a.made.top_pair_medium.weight + a.made.top_pair_weak.weight;
    expect(topPair).toBe(rangeSize(parseRange('AQ'), board));
    expect(a.made.top_pair_good.combos.every((k) => k.startsWith('A') && k[2] === 'Q')).toBe(true);
    expect(a.made.middle_pair.weight).toBe(rangeSize(parseRange('KQ'), board));
    expect(a.made.pp_between.weight).toBe(6);
    expect(a.made.nothing.weight).toBe(4);
  });

  it('made categories add up to the live combos', () => {
    const sum = MADE_CATEGORIES.reduce((s, c) => s + a.made[c].weight, 0);
    expect(sum).toBe(a.total);
    expect(a.total).toBe(rangeSize(range, board));
  });

  it('backdoor flush needs three cards of one suit', () => {
    // Only spades, diamonds and clubs have one card on this board; hearts have none.
    expect(classifyCombo(hole('T♠9♠'), board).draws).toContain('backdoor_flush');
    expect(classifyCombo(hole('T♦9♦'), board).draws).toContain('backdoor_flush');
    expect(classifyCombo(hole('T♣9♣'), board).draws).toContain('backdoor_flush');
    expect(classifyCombo(hole('T♥9♥'), board).draws).not.toContain('backdoor_flush');
    expect(classifyCombo(hole('T♥9♥'), board).made).toBe('nothing');
  });

  it('filters keep / remove', () => {
    const kept = filterRange(a, ['set', 'two_pair'], 'keep');
    expect(rangeSize(kept)).toBe(18);
    const removed = filterRange(a, ['set', 'two_pair'], 'remove');
    expect(rangeSize(removed)).toBe(a.total - 18);
  });
});

describe('draws', () => {
  it('finds combo draws, open-enders and gutshots', () => {
    const combo = classifyCombo(hole('9♥8♥'), cards('7♥6♦2♥')).draws;
    expect(combo).toEqual(expect.arrayContaining(['combo_draw', 'flush_draw', 'oesd']));
    expect(classifyCombo(hole('9♠8♠'), cards('7♥6♦2♣')).draws).toContain('oesd');
    const gut = classifyCombo(hole('9♠7♠'), cards('8♥5♦2♣')).draws;
    expect(gut).toContain('gutshot');
    expect(gut).not.toContain('oesd');
  });

  it('marks the nut flush draw', () => {
    const nut = classifyCombo(hole('A♥5♣'), cards('K♥8♥3♥'));
    expect(nut.made).toBe('ace_high');
    expect(nut.draws).toContain('nut_flush_draw');
    expect(classifyCombo(hole('Q♥5♥'), cards('K♥8♥3♣')).draws).not.toContain('nut_flush_draw');
  });

  it('ignores a straight that is all on the board', () => {
    expect(classifyCombo(hole('2♣2♦'), cards('9♠T♥J♦Q♣K♠')).made).not.toBe('straight');
  });
});

describe('top X %', () => {
  it('is empty at 0 and full at 100', () => {
    expect(rangeSize(topPercent(0))).toBe(0);
    expect(rangeSize(topPercent(100))).toBe(1326);
  });

  it('every bigger percentage contains the smaller one', () => {
    let prev = topPercent(0);
    for (let p = 1; p <= 100; p++) {
      const next = topPercent(p);
      for (const k of Object.keys(prev)) expect(next[k]).toBe(1);
      expect(rangeSize(next)).toBeGreaterThanOrEqual(rangeSize(prev));
      prev = next;
    }
  });

  it('starts with AA', () => {
    expect(Object.keys(topPercent(0.4)).every((k) => k[0] === 'A' && k[2] === 'A')).toBe(true);
  });
});

describe('turn table', () => {
  const range = presetRange('co');
  const flop = cards('A♠K♦7♣');

  it('has one row per unseen card', () => {
    expect(nextCardTable(range, flop, null)).toHaveLength(49);
    // Hero's two cards are also out of the deck.
    expect(nextCardTable(range, flop, cards('Q♠Q♥'), { equitySamples: 50 })).toHaveLength(47);
  });

  it('matches the full analysis of each 4-card board', () => {
    const rows = nextCardTable(range, flop, null);
    for (const row of rows.slice(0, 12)) {
      const a = analyzeRange(range, [...flop, row.card]);
      expect(row.topPairPlus).toBeCloseTo(topPairPlusShare(a), 10);
      expect(row.draws).toBeCloseTo(drawShare(a), 10);
    }
  });
});

describe('range equity', () => {
  it('is exact on the river', () => {
    // Hero's nut straight vs a range of sets and two pairs: wins every hand.
    const r = rangeEquity({ hero: cards('Q♣J♣'), range: parseRange('AA, KK, AK'), board: cards('A♠K♦T♣3♥2♠') });
    expect(r?.method).toBe('exact');
    expect(r?.equity).toBe(1);
  });

  it('roughly matches known values on the flop', () => {
    // AA vs KK preflop is about 82 %.
    const r = rangeEquity({
      hero: cards('A♠A♥'),
      range: parseRange('KK'),
      board: [],
      samples: 20_000,
      random: seededRandom(5),
    });
    expect(r!.equity).toBeGreaterThan(0.79);
    expect(r!.equity).toBeLessThan(0.85);
  });

  it('splits equity by category', () => {
    const r = rangeEquity({
      hero: cards('Q♠Q♥'),
      range: parseRange('AA, KK, 77, AK, AQ, KQ, T9s'),
      board: cards('A♠K♦7♣2♥'),
    });
    expect(r?.method).toBe('exact');
    expect(r!.byMade.set!.equity).toBeLessThan(0.05);
    expect(r!.byMade.nothing!.equity).toBeGreaterThan(0.7);
  });

  it('works without a Hero (range vs a random hand)', () => {
    const r = rangeEquity({ hero: null, range: parseRange('AA'), board: [], samples: 10_000, random: seededRandom(9) });
    expect(r!.equity).toBeGreaterThan(0.82);
    expect(r!.equity).toBeLessThan(0.88);
  });

  it('returns null for an empty range', () => {
    expect(rangeEquity({ hero: null, range: {}, board: [] })).toBeNull();
  });
});
