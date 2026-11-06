// Reparto de manos.
import { type Card, fullDeck, shuffle } from './cards';
import { type Coordination, FLOP_COORDINATIONS, classifyBoard } from './coordination';

export interface Deal {
  hole: Card[];
  flop: Card[];
}

export function dealRandom(random: () => number = Math.random): Deal {
  const deck = shuffle(fullDeck(), random);
  return { hole: deck.slice(0, 2), flop: deck.slice(2, 5) };
}

/**
 * Modo equilibrado: se elige al azar el tipo de mesa (coordinada, semicoordinada
 * o seca) con la misma probabilidad y se reparte hasta obtener un flop de ese tipo.
 */
export function dealBalanced(random: () => number = Math.random): Deal {
  const target: Coordination = FLOP_COORDINATIONS[Math.floor(random() * FLOP_COORDINATIONS.length)];
  for (let i = 0; i < 1000; i++) {
    const deal = dealRandom(random);
    if (classifyBoard(deal.flop).coordination === target) return deal;
  }
  return dealRandom(random);
}
