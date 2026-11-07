import { describe, expect, it } from 'vitest';
import { calculateEquity, cardToInt, categoryOf, currentHand, evaluate, intToCard, parseCards, seededRandom } from './index';

const ev = (s: string) => evaluate(parseCards(s).map(cardToInt));
const cat = (s: string) => categoryOf(ev(s));
const cards = (s: string) => parseCards(s);

describe('card encoding', () => {
  it('round-trips all 52 cards', () => {
    for (let c = 0; c < 52; c++) expect(cardToInt(intToCard(c))).toBe(c);
  });
});

describe('evaluator', () => {
  it('recognises every category', () => {
    expect(cat('A♠K♠Q♠J♠T♠3♥2♦')).toBe('straight_flush');
    expect(cat('9♠9♥9♦9♣K♠3♥2♦')).toBe('quads');
    expect(cat('9♠9♥9♦K♣K♠3♥2♦')).toBe('full_house');
    expect(cat('A♥J♥8♥4♥2♥K♠K♦')).toBe('flush');
    expect(cat('A♠2♥3♦4♣5♠K♥K♦')).toBe('straight');
    expect(cat('7♠7♥7♦K♣Q♠3♥2♦')).toBe('trips');
    expect(cat('7♠7♥K♦K♣Q♠3♥2♦')).toBe('two_pair');
    expect(cat('7♠7♥A♦K♣Q♠3♥2♦')).toBe('pair');
    expect(cat('A♠J♥9♦7♣5♠3♥2♦')).toBe('high_card');
  });

  it('a wheel (A-5) loses to a six-high straight', () => {
    expect(ev('A♠2♥3♦4♣5♠')).toBeLessThan(ev('2♠3♥4♦5♣6♠'));
  });

  it('the kicker breaks ties', () => {
    expect(ev('A♠A♥K♦7♣5♠')).toBeGreaterThan(ev('A♦A♣Q♦7♥5♥'));
  });

  it('two sets of trips make a full house with the second as the pair', () => {
    expect(ev('9♠9♥9♦5♣5♠5♥2♦')).toBe(ev('9♠9♥9♦5♣5♠'));
  });

  it('three pairs: the best loose card is the kicker', () => {
    expect(ev('K♠K♥Q♦Q♣2♠2♥A♦')).toBeGreaterThan(ev('K♠K♥Q♦Q♣2♠2♥J♦'));
  });

  it('a six-card flush uses the five highest', () => {
    expect(ev('A♥K♥9♥7♥4♥2♥3♠')).toBe(ev('A♥K♥9♥7♥4♥'));
  });

  it('ace-low straight flush', () => {
    expect(cat('A♦2♦3♦4♦5♦K♠Q♠')).toBe('straight_flush');
  });

  it('current hand from the known cards', () => {
    expect(currentHand(cards('A♠A♥'), cards('A♦K♣K♠'))).toBe('full_house');
    expect(currentHand(cards('A♠A♥'), [])).toBeNull();
  });
});

describe('equity', () => {
  it('is exact and deterministic on the river', () => {
    const r = calculateEquity({ players: [cards('A♠A♥'), cards('K♠K♥')], board: cards('2♣7♦9♥J♣3♠') });
    expect(r.method).toBe('exact');
    expect(r.samples).toBe(1);
    expect(r.players[0].win).toBe(1);
    expect(r.players[1].win).toBe(0);
  });

  it('splits the pot when the board plays', () => {
    const r = calculateEquity({ players: [cards('2♠3♥'), cards('2♦3♣')], board: cards('A♠K♥Q♦J♣T♠') });
    expect(r.players[0].tie).toBe(1);
    expect(r.players[0].equity).toBeCloseTo(0.5);
  });

  it('enumerates the 990 combinations on the flop', () => {
    const r = calculateEquity({ players: [cards('A♠A♥'), cards('K♠K♥')], board: cards('2♣7♦9♥') });
    expect(r.method).toBe('exact');
    expect(r.samples).toBe(990);
    // KK needs one of the 2 remaining kings (or an unlikely runner-runner)
    expect(r.players[1].equity).toBeGreaterThan(0.07);
    expect(r.players[1].equity).toBeLessThan(0.11);
  });

  it('AA vs KK preflop is about 82%', () => {
    const r = calculateEquity(
      { players: [cards('A♠A♥'), cards('K♠K♥')], board: [] },
      { samples: 30_000, random: seededRandom(1) },
    );
    expect(r.method).toBe('monte_carlo');
    expect(r.players[0].equity).toBeGreaterThan(0.8);
    expect(r.players[0].equity).toBeLessThan(0.84);
  });

  it('AKs vs QQ is about 46%', () => {
    const r = calculateEquity(
      { players: [cards('A♠K♠'), cards('Q♥Q♦')], board: [] },
      { samples: 30_000, random: seededRandom(2) },
    );
    expect(r.players[0].equity).toBeGreaterThan(0.44);
    expect(r.players[0].equity).toBeLessThan(0.48);
  });

  it('AA vs a random hand is about 85%', () => {
    const r = calculateEquity(
      { players: [cards('A♠A♥'), [null, null]], board: [] },
      { samples: 30_000, random: seededRandom(3) },
    );
    expect(r.players[0].equity).toBeGreaterThan(0.83);
    expect(r.players[0].equity).toBeLessThan(0.87);
  });

  it('equities add up to 1 with several players', () => {
    const r = calculateEquity(
      { players: [cards('A♠K♠'), cards('7♥7♦'), [null, null], [cards('Q♣')[0], null]], board: cards('7♠2♠') },
      { samples: 5_000, random: seededRandom(4) },
    );
    const sum = r.players.reduce((a, p) => a + p.equity, 0);
    expect(sum).toBeCloseTo(1, 6);
    for (const p of r.players) {
      expect(p.categories.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
    }
  });

  it('rejects duplicate cards and fewer than 2 players', () => {
    expect(() => calculateEquity({ players: [cards('A♠A♥'), cards('A♠K♥')], board: [] })).toThrow();
    expect(() => calculateEquity({ players: [cards('A♠A♥')], board: [] })).toThrow();
  });
});
