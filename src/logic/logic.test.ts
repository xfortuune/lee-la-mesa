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

describe('coordinación (tests obligatorios)', () => {
  const cases: [string, Coordination][] = [
    ['J♠8♥7♦', 'coordinada'],
    ['2♣K♦7♥', 'seca'],
    ['6♠4♥7♦', 'semicoordinada'],
    ['A♠4♥5♦', 'seca'],
    ['J♠8♥5♦', 'semicoordinada'],
    ['9♠6♥K♦', 'semicoordinada'],
    ['K♠T♥6♦', 'semicoordinada'],
    ['J♠7♠5♥', 'semicoordinada'],
    ['T♥6♥A♦', 'semicoordinada'],
    ['A♣T♣5♦', 'semicoordinada'],
    ['Q♠8♥3♦', 'seca'],
    ['A♠9♥4♦', 'seca'],
    ['K♠8♥6♦', 'semicoordinada'],
    ['Q♠9♥4♦', 'semicoordinada'],
    ['9♠6♠2♠', 'coordinada'],
  ];
  it.each(cases)('%s → %s', (flop, expected) => {
    expect(coord(flop)).toBe(expected);
  });
});

describe('fuerza (tests obligatorios)', () => {
  const cases: [string, string, Strength][] = [
    ['J♣9♦', 'J♠9♥8♦', 'fuerte'],
    ['T♣7♦', 'J♠9♥8♦', 'muy_fuerte'],
    ['K♣T♦', '6♠8♥7♦', 'nada'],
    ['K♣Q♦', 'Q♠8♥3♦', 'fuerte'],
    ['A♣8♦', 'K♠8♥6♦', 'media'],
    ['K♣8♦', 'A♠9♥4♦', 'debil'],
    ['A♣Q♦', 'A♠Q♥2♦', 'muy_fuerte'],
    ['K♣J♦', 'Q♠9♥4♦', 'nada'],
    ['T♣9♦', 'T♠4♥4♦', 'fuerte'],
    ['T♣T♦', 'T♠4♥4♦', 'muy_fuerte'],
  ];
  it.each(cases)('%s en %s → %s', (hole, flop, expected) => {
    expect(strength(hole, flop)).toBe(expected);
  });
});

describe('detalles de coordinación', () => {
  it('detecta escaleras con As alto y bajo', () => {
    expect(hasStraight([14, 2, 3, 4, 5])).toBe(true);
    expect(hasStraight([10, 11, 12, 13, 14])).toBe(true);
    expect(hasStraight([13, 14, 2, 3, 4])).toBe(false);
  });

  it('6-4-7 solo tiene 85 y 53 como escaleras', () => {
    expect(straightCombos(parseCards('6♠4♥7♦')).sort()).toEqual(['53', '85']);
  });

  it('A-4-5 solo tiene 32', () => {
    expect(straightCombos(parseCards('A♠4♥5♦'))).toEqual(['32']);
  });

  it('una mesa emparejada nunca es coordinada', () => {
    expect(coord('9♠9♥8♦')).not.toBe('coordinada');
    expect(coord('T♠T♥4♦')).toBe('seca');
  });

  it('la explicación cuenta los huecos', () => {
    const r = classifyBoard(parseCards('K♠8♥6♦'));
    expect(r.reason).toContain('entre 8 y 6 hay 1 hueco (7)');
  });

  it('monocolor siempre es coordinada', () => {
    expect(coord('A♥7♥2♥')).toBe('coordinada');
  });

  it('solo evalúa flops de 3 cartas por ahora', () => {
    expect(() => classifyBoard(parseCards('A♥7♥2♥3♣'))).toThrow();
  });
});

describe('detalles de fuerza', () => {
  it('overpair en mesa seca es fuerte', () => {
    expect(strength('A♣A♦', 'Q♠8♥3♦')).toBe('fuerte');
  });

  it('pareja máxima con apoyo malo en mesa seca es media', () => {
    expect(strength('Q♣4♦', 'Q♠8♥3♦')).toBe('media');
  });

  it('pareja máxima con el mejor apoyo en mesa seca es fuerte', () => {
    expect(strength('A♣Q♦', 'Q♠8♥3♦')).toBe('fuerte');
  });

  it('pareja media con apoyo malo es débil', () => {
    expect(strength('8♣4♦', 'K♠8♥6♦')).toBe('debil');
  });

  it('pareja media con el segundo mejor apoyo es media', () => {
    // En K86 para pareja de 8: mejor A, segundo Q
    expect(strength('Q♣8♦', 'K♠8♥6♦')).toBe('media');
  });

  it('pareja en mano entre la primera y la segunda carta es media', () => {
    expect(strength('T♣T♦', 'K♠8♥6♦')).toBe('media');
  });

  it('pareja en mano por debajo de la segunda carta es débil', () => {
    expect(strength('7♣7♦', 'K♠8♥6♦')).toBe('debil');
  });

  it('set en mesa seca es muy fuerte', () => {
    expect(strength('8♣8♦', 'K♠8♥6♦')).toBe('muy_fuerte');
  });

  it('dobles parejas que no son las mejores en mesa seca son fuertes', () => {
    expect(strength('K♣6♣', 'K♠8♥6♦')).toBe('fuerte');
  });

  it('en mesa coordinada la pareja máxima es media y el set fuerte', () => {
    expect(strength('J♣2♦', 'J♠8♥7♦')).toBe('media');
    expect(strength('8♣8♦', 'J♠8♥7♦')).toBe('fuerte');
  });

  it('en mesa coordinada pareja media o As alto es débil', () => {
    expect(strength('8♣2♦', 'J♠8♥7♦')).toBe('debil');
    expect(strength('A♣2♦', 'J♠8♥7♦')).toBe('debil');
  });

  it('en mesa monocolor el color es muy fuerte y la escalera fuerte', () => {
    expect(strength('2♠3♠', '9♠6♠T♠')).toBe('muy_fuerte');
    expect(strength('8♥7♦', '9♠6♠T♠')).toBe('fuerte');
  });

  it('escalera en mesa semicoordinada (combinación de excepción) es muy fuerte', () => {
    expect(strength('8♣5♦', '6♠4♥7♦')).toBe('muy_fuerte');
  });

  it('en mesa emparejada el trío es fuerte y el full muy fuerte', () => {
    expect(strength('A♣4♣', 'T♠4♥4♦')).toBe('fuerte');
    expect(strength('T♣4♣', 'T♠4♥4♦')).toBe('muy_fuerte');
  });

  it('decisiones provisionales de DUDAS.md', () => {
    expect(strength('T♣2♦', 'T♠4♥4♦')).toBe('fuerte');
    expect(strength('A♣K♦', '7♠7♥7♦')).toBe('debil');
    expect(strength('Q♣Q♦', '7♠7♥7♦')).toBe('muy_fuerte');
    expect(strength('3♣3♦', 'T♠4♥4♦')).toBe('debil');
    expect(strength('6♣2♦', 'K♠8♥6♦')).toBe('debil');
  });

  it('carta alta Rey sin As en mesa es nada', () => {
    expect(strength('K♣J♦', 'Q♠9♥4♦')).toBe('nada');
  });

  it('devuelve el motivo además de la categoría', () => {
    const r = evaluateHand(parseCards('A♣8♦'), parseCards('K♠8♥6♦'));
    expect(r.reason).toContain('pareja media de 8 con el mejor apoyo (A)');
    expect(r.reason).toContain('mano media');
  });
});

describe('reparto', () => {
  it('reparte 5 cartas distintas', () => {
    for (let i = 0; i < 200; i++) {
      const { hole, flop } = dealRandom();
      const keys = new Set([...hole, ...flop].map((c) => `${c.rank}${c.suit}`));
      expect(keys.size).toBe(5);
    }
  });

  it('el modo equilibrado reparte los tres tipos en proporción parecida', () => {
    const counts: Record<string, number> = { coordinada: 0, semicoordinada: 0, seca: 0 };
    for (let i = 0; i < 900; i++) counts[classifyBoard(dealBalanced().flop).coordination]++;
    for (const n of Object.values(counts)) expect(n).toBeGreaterThan(200);
  });

  it('todas las manos posibles se pueden evaluar sin errores', () => {
    for (let i = 0; i < 5000; i++) {
      const { hole, flop } = dealRandom();
      const r = evaluateHand(hole, flop);
      expect(r.reason.length).toBeGreaterThan(10);
    }
  });
});
