import { describe, expect, it } from 'vitest';
import {
  type Coordination,
  type Strength,
  classifyBoard,
  dealBalanced,
  dealRandom,
  evaluateHand,
  hasStraight,
  parseCards,
  straightCombos,
} from './index';

const coord = (flop: string) => classifyBoard(parseCards(flop)).coordination;
const strength = (hole: string, flop: string) => evaluateHand(parseCards(hole), parseCards(flop)).strength;

describe('board texture (required cases)', () => {
  const cases: [string, Coordination][] = [
    ['J♠8♥7♦', 'coordinated'],
    ['2♣K♦7♥', 'dry'],
    ['6♠4♥7♦', 'semi'],
    ['A♠4♥5♦', 'dry'],
    ['J♠8♥5♦', 'semi'],
    ['9♠6♥K♦', 'semi'],
    ['K♠T♥6♦', 'semi'],
    ['J♠7♠5♥', 'semi'],
    ['T♥6♥A♦', 'semi'],
    ['A♣T♣5♦', 'semi'],
    ['Q♠8♥3♦', 'dry'],
    ['A♠9♥4♦', 'dry'],
    ['K♠8♥6♦', 'semi'],
    ['Q♠9♥4♦', 'semi'],
    ['9♠6♠2♠', 'coordinated'],
  ];
  it.each(cases)('%s → %s', (flop, expected) => {
    expect(coord(flop)).toBe(expected);
  });
});

describe('hand strength (required cases)', () => {
  const cases: [string, string, Strength][] = [
    ['J♣9♦', 'J♠9♥8♦', 'strong'],
    ['T♣7♦', 'J♠9♥8♦', 'very_strong'],
    ['K♣T♦', '6♠8♥7♦', 'nothing'],
    ['K♣Q♦', 'Q♠8♥3♦', 'strong'],
    ['A♣8♦', 'K♠8♥6♦', 'medium'],
    ['K♣8♦', 'A♠9♥4♦', 'weak'],
    ['A♣Q♦', 'A♠Q♥2♦', 'very_strong'],
    ['K♣J♦', 'Q♠9♥4♦', 'nothing'],
    ['T♣9♦', 'T♠4♥4♦', 'strong'],
    ['T♣T♦', 'T♠4♥4♦', 'very_strong'],
  ];
  it.each(cases)('%s on %s → %s', (hole, flop, expected) => {
    expect(strength(hole, flop)).toBe(expected);
  });
});

describe('board texture details', () => {
  it('detects ace-high and ace-low straights', () => {
    expect(hasStraight([14, 2, 3, 4, 5])).toBe(true);
    expect(hasStraight([10, 11, 12, 13, 14])).toBe(true);
    expect(hasStraight([13, 14, 2, 3, 4])).toBe(false);
  });

  it('6-4-7 only has the 85 and 53 straights', () => {
    expect(straightCombos(parseCards('6♠4♥7♦')).sort()).toEqual(['53', '85']);
  });

  it('A-4-5 only has 32', () => {
    expect(straightCombos(parseCards('A♠4♥5♦'))).toEqual(['32']);
  });

  it('a paired board is never coordinated', () => {
    expect(coord('9♠9♥8♦')).not.toBe('coordinated');
    expect(coord('T♠T♥4♦')).toBe('dry');
  });

  it('the explanation counts the gaps', () => {
    expect(classifyBoard(parseCards('K♠8♥6♦'), 'es').reason).toContain('entre 8 y 6 hay 1 hueco (7)');
    expect(classifyBoard(parseCards('K♠8♥6♦'), 'en').reason).toContain('between 8 and 6 there is 1 gap (7)');
  });

  it('a monotone board is always at least coordinated', () => {
    expect(coord('A♥7♥2♥')).toBe('coordinated');
  });

  it('monotone with a possible straight is extremely coordinated', () => {
    expect(coord('6♠7♠8♠')).toBe('extreme');
    expect(coord('K♥Q♥J♥')).toBe('extreme');
    expect(coord('9♦7♦5♦')).toBe('extreme');
    expect(coord('Q♣J♣9♣')).toBe('extreme');
  });

  it('monotone without a valid straight stays coordinated', () => {
    expect(coord('K♠Q♠2♠')).toBe('coordinated');
    expect(coord('9♠6♠2♠')).toBe('coordinated');
    // 6-4-7 only has exception straights
    expect(coord('6♥4♥7♥')).toBe('coordinated');
    expect(coord('A♣2♣3♣')).toBe('coordinated'); // only 54, an exception
  });

  it('a straight without a monotone board is not extremely coordinated', () => {
    expect(coord('6♠7♠8♥')).toBe('coordinated');
  });

  it('only evaluates 3-card flops for now', () => {
    expect(() => classifyBoard(parseCards('A♥7♥2♥3♣'))).toThrow();
  });
});

describe('hand strength details', () => {
  it('an overpair on a dry board is strong', () => {
    expect(strength('A♣A♦', 'Q♠8♥3♦')).toBe('strong');
  });

  it('top pair with a bad kicker on a dry board is medium', () => {
    expect(strength('Q♣4♦', 'Q♠8♥3♦')).toBe('medium');
  });

  it('top pair with the best kicker on a dry board is strong', () => {
    expect(strength('A♣Q♦', 'Q♠8♥3♦')).toBe('strong');
  });

  it('middle pair with a bad kicker is weak', () => {
    expect(strength('8♣4♦', 'K♠8♥6♦')).toBe('weak');
  });

  it('middle pair with the second-best kicker is medium', () => {
    // On K86 for a pair of 8s: best A, second Q
    expect(strength('Q♣8♦', 'K♠8♥6♦')).toBe('medium');
  });

  it('a pocket pair between the first and second board card is medium', () => {
    expect(strength('T♣T♦', 'K♠8♥6♦')).toBe('medium');
  });

  it('a pocket pair below the second board card is weak', () => {
    expect(strength('7♣7♦', 'K♠8♥6♦')).toBe('weak');
  });

  it('a set on a dry board is very strong', () => {
    expect(strength('8♣8♦', 'K♠8♥6♦')).toBe('very_strong');
  });

  it('two pair that is not the best on a dry board is strong', () => {
    expect(strength('K♣6♣', 'K♠8♥6♦')).toBe('strong');
  });

  it('on a coordinated board top pair is medium and a set is strong', () => {
    expect(strength('J♣2♦', 'J♠8♥7♦')).toBe('medium');
    expect(strength('8♣8♦', 'J♠8♥7♦')).toBe('strong');
  });

  it('on a coordinated board middle pair or ace high is weak', () => {
    expect(strength('8♣2♦', 'J♠8♥7♦')).toBe('weak');
    expect(strength('A♣2♦', 'J♠8♥7♦')).toBe('weak');
  });

  it('on a monotone board a flush is very strong and a straight strong', () => {
    expect(strength('2♠3♠', '9♠6♠T♠')).toBe('very_strong');
    expect(strength('8♥7♦', '9♠6♠T♠')).toBe('strong');
  });

  it('a straight on a semi-coordinated board (exception combo) is very strong', () => {
    expect(strength('8♣5♦', '6♠4♥7♦')).toBe('very_strong');
  });

  it('on a paired board trips are strong and a full house very strong', () => {
    expect(strength('A♣4♣', 'T♠4♥4♦')).toBe('strong');
    expect(strength('T♣4♣', 'T♠4♥4♦')).toBe('very_strong');
  });

  it('an extremely coordinated board is rated like a monotone coordinated one', () => {
    expect(strength('9♠T♠', '6♠7♠8♠')).toBe('very_strong'); // straight flush
    expect(strength('A♠2♠', '6♠7♠8♠')).toBe('very_strong'); // flush
    expect(strength('9♥5♦', '6♠7♠8♠')).toBe('strong'); // non-flush straight
    expect(strength('8♥8♦', '6♠7♠8♠')).toBe('strong'); // set
    expect(strength('A♥A♦', '6♠7♠8♠')).toBe('medium'); // overpair
    expect(strength('A♥2♦', '6♠7♠8♠')).toBe('weak');
    expect(strength('K♥2♦', '6♠7♠8♠')).toBe('nothing');
  });

  it('provisional decisions from NOTES.md', () => {
    expect(strength('T♣2♦', 'T♠4♥4♦')).toBe('strong');
    expect(strength('A♣K♦', '7♠7♥7♦')).toBe('weak');
    expect(strength('Q♣Q♦', '7♠7♥7♦')).toBe('very_strong');
    expect(strength('3♣3♦', 'T♠4♥4♦')).toBe('weak');
    expect(strength('6♣2♦', 'K♠8♥6♦')).toBe('weak');
  });

  it('king high without an ace on the board is nothing', () => {
    expect(strength('K♣J♦', 'Q♠9♥4♦')).toBe('nothing');
  });

  it('returns the reason along with the category', () => {
    const es = evaluateHand(parseCards('A♣8♦'), parseCards('K♠8♥6♦'), 'es');
    expect(es.reason).toContain('pareja media de 8 con el mejor apoyo (A)');
    expect(es.reason).toContain('mano media');
  });
});

describe('dealing', () => {
  it('deals 5 distinct cards', () => {
    for (let i = 0; i < 200; i++) {
      const { hole, flop } = dealRandom();
      const keys = new Set([...hole, ...flop].map((c) => `${c.rank}${c.suit}`));
      expect(keys.size).toBe(5);
    }
  });

  it('balanced mode deals board types by their weights', () => {
    const counts: Record<Coordination, number> = { extreme: 0, coordinated: 0, semi: 0, dry: 0 };
    for (let i = 0; i < 1000; i++) counts[classifyBoard(dealBalanced().flop).coordination]++;
    expect(counts.extreme).toBeGreaterThan(50);
    expect(counts.coordinated).toBeGreaterThan(220);
    expect(counts.semi).toBeGreaterThan(220);
    expect(counts.dry).toBeGreaterThan(220);
  });

  it('every possible hand can be evaluated without errors', () => {
    for (let i = 0; i < 5000; i++) {
      const { hole, flop } = dealRandom();
      const r = evaluateHand(hole, flop);
      expect(r.reason.length).toBeGreaterThan(10);
    }
  });
});
