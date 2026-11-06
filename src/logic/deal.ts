// Reparto de manos.
import { type Card, fullDeck, shuffle } from './cards';
import { type Coordination, classifyBoard } from './coordination';

export interface Deal {
  hole: Card[];
  flop: Card[];
}

export function dealRandom(random: () => number = Math.random): Deal {
  const deck = shuffle(fullDeck(), random);
  return { hole: deck.slice(0, 2), flop: deck.slice(2, 5) };
}

/**
 * Peso de cada tipo de mesa en el modo equilibrado. La extremadamente coordinada
 * es un caso muy puntual, así que sale menos que las otras tres.
 */
export const BALANCED_WEIGHTS: Record<Coordination, number> = {
  extremadamente_coordinada: 0.1,
  coordinada: 0.3,
  semicoordinada: 0.3,
  seca: 0.3,
};

function pickTarget(random: () => number): Coordination {
  let x = random();
  for (const [c, w] of Object.entries(BALANCED_WEIGHTS) as [Coordination, number][]) {
    if (x < w) return c;
    x -= w;
  }
  return 'seca';
}

/**
 * Modo equilibrado: se elige el tipo de mesa según BALANCED_WEIGHTS y se reparte
 * hasta obtener un flop de ese tipo.
 */
export function dealBalanced(random: () => number = Math.random): Deal {
  const target = pickTarget(random);
  for (let i = 0; i < 20000; i++) {
    const deal = dealRandom(random);
    if (classifyBoard(deal.flop).coordination === target) return deal;
  }
  return dealRandom(random);
}
