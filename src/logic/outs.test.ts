import { describe, expect, it } from 'vitest';
import { cardsToString, computeOuts, dealOuts, parseCards, percentOptions, seededRandom } from './index';

const outs = (hole: string, board: string) => computeOuts(parseCards(hole), parseCards(board));
const count = (hole: string, board: string) => outs(hole, board).outs.length;
const group = (hole: string, board: string, reason: string) =>
  outs(hole, board).groups.find((g) => g.reason === reason)?.cards.length ?? 0;

describe('counting outs: draws', () => {
  it('flush draw: 9 outs', () => {
    // 6♥ and 5♥ are below the board: no overcards
    expect(count('6♥5♥', 'K♥9♥2♣')).toBe(9);
    expect(group('6♥5♥', 'K♥9♥2♣', 'flush')).toBe(9);
  });

  it('open-ended straight draw: 8 outs (+ overcards)', () => {
    expect(group('9♠8♦', '7♣6♥2♠', 'straight')).toBe(8);
    // 9 and 8 are overcards: 3 + 3
    expect(group('9♠8♦', '7♣6♥2♠', 'top_pair')).toBe(6);
    expect(count('9♠8♦', '7♣6♥2♠')).toBe(14);
  });

  it('gutshot without overcards: 4 outs', () => {
    expect(count('9♠7♦', 'J♣8♥2♦')).toBe(4);
  });

  it('flush + open-ended straight draw: 15 outs', () => {
    // 8♥7♥ on 6♥5♥K♣: flush 9 + straight 6 (the non-heart 9s and 4s)
    const r = outs('8♥7♥', '6♥5♥K♣');
    expect(r.outs.length).toBe(15);
    expect(r.groups.map((g) => g.reason)).toContain('straight_flush');
  });

  it('flush + two overcards: 15 outs', () => {
    expect(group('A♥K♥', 'Q♥7♥2♣', 'flush')).toBe(9);
    expect(group('A♥K♥', 'Q♥7♥2♣', 'top_pair')).toBe(6);
    expect(count('A♥K♥', 'Q♥7♥2♣')).toBe(15);
  });
});

describe('counting outs: improvements', () => {
  it('pocket pair to a set: 2 outs', () => {
    expect(count('5♠5♦', 'K♣9♥2♦')).toBe(2);
  });

  it('top pair to two pair or trips: 5 outs', () => {
    expect(count('Q♠J♦', 'Q♥7♣3♦')).toBe(5);
  });

  it('two pair to a full house: 4 outs', () => {
    expect(count('A♠7♦', 'A♥7♣3♦')).toBe(4);
  });

  it('a set to a full house or quads: 7 outs on the flop', () => {
    expect(count('7♠7♦', 'A♥7♣3♦')).toBe(7);
  });

  it('pairing a card below the highest board card does not count', () => {
    // J and 4 on K-8-2: neither is an overcard, no draws
    expect(count('J♠4♦', 'K♣8♥2♦')).toBe(0);
  });

  it('a card that only pairs the board is not an out', () => {
    const r = outs('Q♠J♦', 'Q♥7♣3♦');
    expect(r.outs.map((c) => c.rank)).not.toContain(7);
    expect(r.outs.map((c) => c.rank)).not.toContain(3);
  });
});

describe('probabilities', () => {
  it('flop: rule of 4 and exact', () => {
    const r = outs('6♥5♥', 'K♥9♥2♣');
    expect(r.street).toBe('flop');
    expect(r.unseen).toBe(47);
    expect(r.estimate).toBe(36);
    expect(r.exact).toBeCloseTo(34.97, 1);
  });

  it('turn: rule of 2 and exact', () => {
    const r = outs('6♥5♥', 'K♥9♥2♣3♦');
    expect(r.street).toBe('turn');
    expect(r.unseen).toBe(46);
    // flush 9 + gutshot to the 4 (3 non-hearts) = 12
    expect(r.outs.length).toBe(12);
    expect(r.estimate).toBe(24);
    expect(r.exact).toBeCloseTo((12 / 46) * 100, 5);
  });

  it('percentage options: 4 distinct, including the correct one', () => {
    for (let s = 0; s < 50; s++) {
      const r = outs('6♥5♥', 'K♥9♥2♣');
      const opts = percentOptions(r, seededRandom(s));
      expect(opts).toContain(36);
      expect(new Set(opts).size).toBe(4);
    }
  });

  it('the reason lists the cards', () => {
    const r = computeOuts(parseCards('6♥5♥'), parseCards('K♥9♥2♣'), 'es');
    expect(r.reason).toContain('color (9 outs');
    expect(r.reason).toContain(cardsToString(r.groups[0].cards));
  });
});

describe('dealing spots', () => {
  it('always has outs, an unpaired board and nothing made yet', () => {
    const random = seededRandom(7);
    for (let i = 0; i < 300; i++) {
      const { hole, board } = dealOuts(random);
      expect([3, 4]).toContain(board.length);
      expect(new Set(board.map((c) => c.rank)).size).toBe(board.length);
      const r = computeOuts(hole, board);
      expect(r.outs.length).toBeGreaterThanOrEqual(2);
      expect(['high_card', 'pair', 'two_pair', 'trips']).toContain(r.current);
    }
  });
});
