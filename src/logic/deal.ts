// Dealing hands for the board-reading trainer.
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
 * Weight of each board type in balanced mode. Extremely coordinated boards are a rare,
 * special case, so they come up less often than the other three.
 */
export const BALANCED_WEIGHTS: Record<Coordination, number> = {
  extreme: 0.1,
  coordinated: 0.3,
  semi: 0.3,
  dry: 0.3,
};

function pickTarget(random: () => number): Coordination {
  let x = random();
  for (const [c, w] of Object.entries(BALANCED_WEIGHTS) as [Coordination, number][]) {
    if (x < w) return c;
    x -= w;
  }
  return 'dry';
}

/** Balanced mode: picks a board type by BALANCED_WEIGHTS and deals until a flop of that type comes. */
export function dealBalanced(random: () => number = Math.random): Deal {
  const target = pickTarget(random);
  for (let i = 0; i < 20000; i++) {
    const deal = dealRandom(random);
    if (classifyBoard(deal.flop).coordination === target) return deal;
  }
  return dealRandom(random);
}
