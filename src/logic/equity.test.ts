import { describe, expect, it } from 'vitest';
import { calculateEquity, cardToInt, categoryOf, currentHand, evaluate, intToCard, parseCards, seededRandom } from './index';

const ev = (s: string) => evaluate(parseCards(s).map(cardToInt));
const cat = (s: string) => categoryOf(ev(s));
const cards = (s: string) => parseCards(s);

describe('codificación de cartas', () => {
  it('ida y vuelta para las 52 cartas', () => {
    for (let c = 0; c < 52; c++) expect(cardToInt(intToCard(c))).toBe(c);
  });
});

describe('evaluador', () => {
  it('reconoce cada categoría', () => {
    expect(cat('A♠K♠Q♠J♠T♠3♥2♦')).toBe('Escalera de color');
    expect(cat('9♠9♥9♦9♣K♠3♥2♦')).toBe('Póker');
    expect(cat('9♠9♥9♦K♣K♠3♥2♦')).toBe('Full');
    expect(cat('A♥J♥8♥4♥2♥K♠K♦')).toBe('Color');
    expect(cat('A♠2♥3♦4♣5♠K♥K♦')).toBe('Escalera');
    expect(cat('7♠7♥7♦K♣Q♠3♥2♦')).toBe('Trío');
    expect(cat('7♠7♥K♦K♣Q♠3♥2♦')).toBe('Dobles parejas');
    expect(cat('7♠7♥A♦K♣Q♠3♥2♦')).toBe('Pareja');
    expect(cat('A♠J♥9♦7♣5♠3♥2♦')).toBe('Carta alta');
  });

  it('escalera baja (A-5) pierde contra 6-alta', () => {
    expect(ev('A♠2♥3♦4♣5♠')).toBeLessThan(ev('2♠3♥4♦5♣6♠'));
  });

  it('el apoyo desempata', () => {
    expect(ev('A♠A♥K♦7♣5♠')).toBeGreaterThan(ev('A♦A♣Q♦7♥5♥'));
  });

  it('dos tríos forman full con el segundo como pareja', () => {
    expect(ev('9♠9♥9♦5♣5♠5♥2♦')).toBe(ev('9♠9♥9♦5♣5♠'));
  });

  it('tres parejas: cuenta la mejor carta suelta como apoyo', () => {
    expect(ev('K♠K♥Q♦Q♣2♠2♥A♦')).toBeGreaterThan(ev('K♠K♥Q♦Q♣2♠2♥J♦'));
  });

  it('color con 6 cartas del palo usa las 5 más altas', () => {
    expect(ev('A♥K♥9♥7♥4♥2♥3♠')).toBe(ev('A♥K♥9♥7♥4♥'));
  });

  it('escalera de color baja con As', () => {
    expect(cat('A♦2♦3♦4♦5♦K♠Q♠')).toBe('Escalera de color');
  });

  it('mano actual con las cartas conocidas', () => {
    expect(currentHand(cards('A♠A♥'), cards('A♦K♣K♠'))).toBe('Full');
    expect(currentHand(cards('A♠A♥'), [])).toBeNull();
  });
});

describe('equity', () => {
  it('en el river es exacto y determinista', () => {
    const r = calculateEquity({ players: [cards('A♠A♥'), cards('K♠K♥')], board: cards('2♣7♦9♥J♣3♠') });
    expect(r.method).toBe('exacto');
    expect(r.samples).toBe(1);
    expect(r.players[0].win).toBe(1);
    expect(r.players[1].win).toBe(0);
  });

  it('empate repartido cuando la mesa juega', () => {
    const r = calculateEquity({ players: [cards('2♠3♥'), cards('2♦3♣')], board: cards('A♠K♥Q♦J♣T♠') });
    expect(r.players[0].tie).toBe(1);
    expect(r.players[0].equity).toBeCloseTo(0.5);
  });

  it('en el flop enumera las 990 combinaciones', () => {
    const r = calculateEquity({ players: [cards('A♠A♥'), cards('K♠K♥')], board: cards('2♣7♦9♥') });
    expect(r.method).toBe('exacto');
    expect(r.samples).toBe(990);
    // KK necesita una de las 2 K restantes (o runner-runner improbable)
    expect(r.players[1].equity).toBeGreaterThan(0.07);
    expect(r.players[1].equity).toBeLessThan(0.11);
  });

  it('AA contra KK antes del flop ronda el 82 %', () => {
    const r = calculateEquity(
      { players: [cards('A♠A♥'), cards('K♠K♥')], board: [] },
      { samples: 30_000, random: seededRandom(1) },
    );
    expect(r.method).toBe('montecarlo');
    expect(r.players[0].equity).toBeGreaterThan(0.8);
    expect(r.players[0].equity).toBeLessThan(0.84);
  });

  it('AKs contra QQ ronda el 46 %', () => {
    const r = calculateEquity(
      { players: [cards('A♠K♠'), cards('Q♥Q♦')], board: [] },
      { samples: 30_000, random: seededRandom(2) },
    );
    expect(r.players[0].equity).toBeGreaterThan(0.44);
    expect(r.players[0].equity).toBeLessThan(0.48);
  });

  it('AA contra una mano aleatoria ronda el 85 %', () => {
    const r = calculateEquity(
      { players: [cards('A♠A♥'), [null, null]], board: [] },
      { samples: 30_000, random: seededRandom(3) },
    );
    expect(r.players[0].equity).toBeGreaterThan(0.83);
    expect(r.players[0].equity).toBeLessThan(0.87);
  });

  it('las equities suman 1 con varios jugadores', () => {
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

  it('rechaza cartas repetidas y menos de 2 jugadores', () => {
    expect(() => calculateEquity({ players: [cards('A♠A♥'), cards('A♠K♥')], board: [] })).toThrow();
    expect(() => calculateEquity({ players: [cards('A♠A♥')], board: [] })).toThrow();
  });
});
