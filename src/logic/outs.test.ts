import { describe, expect, it } from 'vitest';
import { cardsToString, computeOuts, dealOuts, parseCards, percentOptions, seededRandom } from './index';

const outs = (hole: string, board: string) => computeOuts(parseCards(hole), parseCards(board));
const count = (hole: string, board: string) => outs(hole, board).outs.length;
const group = (hole: string, board: string, reason: string) =>
  outs(hole, board).groups.find((g) => g.reason === reason)?.cards.length ?? 0;

describe('conteo de outs: proyectos', () => {
  it('proyecto de color: 9 outs', () => {
    // 6♥ y 5♥ por debajo de la mesa: sin overcards
    expect(count('6♥5♥', 'K♥9♥2♣')).toBe(9);
    expect(group('6♥5♥', 'K♥9♥2♣', 'Color')).toBe(9);
  });

  it('escalera abierta: 8 outs (+ overcards)', () => {
    expect(group('9♠8♦', '7♣6♥2♠', 'Escalera')).toBe(8);
    // 9 y 8 son overcards: 3 + 3
    expect(group('9♠8♦', '7♣6♥2♠', 'Pareja máxima')).toBe(6);
    expect(count('9♠8♦', '7♣6♥2♠')).toBe(14);
  });

  it('gutshot sin overcards: 4 outs', () => {
    expect(count('9♠7♦', 'J♣8♥2♦')).toBe(4);
  });

  it('color + escalera abierta: 15 outs', () => {
    // 8♥7♥ en 6♥5♥K♣: color 9 + escalera 6 (las 9 y 4 que no son ♥)
    const r = outs('8♥7♥', '6♥5♥K♣');
    expect(r.outs.length).toBe(15);
    expect(r.groups.map((g) => g.reason)).toContain('Escalera de color');
  });

  it('color + dos overcards: 15 outs', () => {
    expect(group('A♥K♥', 'Q♥7♥2♣', 'Color')).toBe(9);
    expect(group('A♥K♥', 'Q♥7♥2♣', 'Pareja máxima')).toBe(6);
    expect(count('A♥K♥', 'Q♥7♥2♣')).toBe(15);
  });
});

describe('conteo de outs: mejoras', () => {
  it('pareja en mano a trío: 2 outs', () => {
    expect(count('5♠5♦', 'K♣9♥2♦')).toBe(2);
  });

  it('pareja máxima a dobles o trío: 5 outs', () => {
    expect(count('Q♠J♦', 'Q♥7♣3♦')).toBe(5);
  });

  it('dobles parejas a full: 4 outs', () => {
    expect(count('A♠7♦', 'A♥7♣3♦')).toBe(4);
  });

  it('trío a full o póker: 7 outs en el flop', () => {
    expect(count('7♠7♦', 'A♥7♣3♦')).toBe(7);
  });

  it('emparejar una carta por debajo de la más alta de la mesa no cuenta', () => {
    // J y 4 con mesa K-8-2: ninguna es overcard, sin proyectos
    expect(count('J♠4♦', 'K♣8♥2♦')).toBe(0);
  });

  it('una carta que solo empareja la mesa no es out', () => {
    const r = outs('Q♠J♦', 'Q♥7♣3♦');
    expect(r.outs.map((c) => c.rank)).not.toContain(7);
    expect(r.outs.map((c) => c.rank)).not.toContain(3);
  });
});

describe('probabilidades', () => {
  it('flop: regla del 4 y exacto', () => {
    const r = outs('6♥5♥', 'K♥9♥2♣');
    expect(r.street).toBe('flop');
    expect(r.unseen).toBe(47);
    expect(r.estimate).toBe(36);
    expect(r.exact).toBeCloseTo(34.97, 1);
  });

  it('turn: regla del 2 y exacto', () => {
    const r = outs('6♥5♥', 'K♥9♥2♣3♦');
    expect(r.street).toBe('turn');
    expect(r.unseen).toBe(46);
    // color 9 + gutshot del 4 (3 que no son ♥) = 12
    expect(r.outs.length).toBe(12);
    expect(r.estimate).toBe(24);
    expect(r.exact).toBeCloseTo((12 / 46) * 100, 5);
  });

  it('opciones de porcentaje: 4 distintas e incluyen la correcta', () => {
    for (let s = 0; s < 50; s++) {
      const r = outs('6♥5♥', 'K♥9♥2♣');
      const opts = percentOptions(r, seededRandom(s));
      expect(opts).toContain(36);
      expect(new Set(opts).size).toBe(4);
    }
  });

  it('el motivo enumera las cartas', () => {
    const r = outs('6♥5♥', 'K♥9♥2♣');
    expect(r.reason).toContain('color (9 outs');
    expect(r.reason).toContain(cardsToString(r.groups[0].cards));
  });
});

describe('reparto de situaciones', () => {
  it('siempre hay outs, mesa sin emparejar y nada hecho', () => {
    const random = seededRandom(7);
    for (let i = 0; i < 300; i++) {
      const { hole, board } = dealOuts(random);
      expect([3, 4]).toContain(board.length);
      expect(new Set(board.map((c) => c.rank)).size).toBe(board.length);
      const r = computeOuts(hole, board);
      expect(r.outs.length).toBeGreaterThanOrEqual(2);
      expect(['Carta alta', 'Pareja', 'Dobles parejas', 'Trío']).toContain(r.current);
    }
  });
});
