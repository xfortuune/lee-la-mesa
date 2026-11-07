// Evaluador de manos de 5–7 cartas y cálculo de equity (probabilidad de ganar/empatar).
import type { Lang } from '../i18n/lang';
import { type Card, SUITS } from './cards';

// Las cartas se codifican como enteros 0..51: rank = (c >> 2) + 2, palo = c & 3.
export function cardToInt(card: Card): number {
  return ((card.rank - 2) << 2) | SUITS.indexOf(card.suit);
}

export function intToCard(c: number): Card {
  return { rank: (c >> 2) + 2, suit: SUITS[c & 3] };
}

export const HAND_CATEGORIES = [
  'Carta alta',
  'Pareja',
  'Dobles parejas',
  'Trío',
  'Escalera',
  'Color',
  'Full',
  'Póker',
  'Escalera de color',
] as const;

export type HandCategory = (typeof HAND_CATEGORIES)[number];

/** Nombre de cada jugada para mostrar (las claves de HAND_CATEGORIES son internas, en español). */
export const HAND_LABELS: Record<Lang, Record<HandCategory | 'Pareja máxima', string>> = {
  es: {
    'Carta alta': 'Carta alta',
    Pareja: 'Pareja',
    'Dobles parejas': 'Dobles parejas',
    Trío: 'Trío',
    Escalera: 'Escalera',
    Color: 'Color',
    Full: 'Full',
    Póker: 'Póker',
    'Escalera de color': 'Escalera de color',
    'Pareja máxima': 'Pareja máxima',
  },
  en: {
    'Carta alta': 'High card',
    Pareja: 'Pair',
    'Dobles parejas': 'Two pair',
    Trío: 'Three of a kind',
    Escalera: 'Straight',
    Color: 'Flush',
    Full: 'Full house',
    Póker: 'Four of a kind',
    'Escalera de color': 'Straight flush',
    'Pareja máxima': 'Top pair',
  },
};

/** Rango más alto de una escalera dentro de la máscara de rangos (bit r = rango r), o 0. */
function straightHigh(mask: number): number {
  if (mask & (1 << 14)) mask |= 1 << 1; // As como 1
  for (let high = 14; high >= 5; high--) {
    const need = 0b11111 << (high - 4);
    if ((mask & need) === need) return high;
  }
  return 0;
}

/** Rangos de la máscara de mayor a menor, como mucho `n`. */
function topRanks(mask: number, n: number): number[] {
  const out: number[] = [];
  for (let r = 14; r >= 2 && out.length < n; r--) if (mask & (1 << r)) out.push(r);
  return out;
}

function pack(category: number, kickers: number[]): number {
  let v = category;
  for (let i = 0; i < 5; i++) v = v * 16 + (kickers[i] ?? 0);
  return v;
}

/** Puntuación comparable (mayor = mejor) de la mejor mano de 5 entre 5–7 cartas. */
export function evaluate(cards: number[]): number {
  const counts = new Array<number>(15).fill(0);
  const suitMasks = [0, 0, 0, 0];
  const suitCounts = [0, 0, 0, 0];
  let rankMask = 0;
  for (const c of cards) {
    const r = (c >> 2) + 2;
    const s = c & 3;
    counts[r]++;
    suitMasks[s] |= 1 << r;
    suitCounts[s]++;
    rankMask |= 1 << r;
  }

  // Color / escalera de color
  for (let s = 0; s < 4; s++) {
    if (suitCounts[s] >= 5) {
      const sf = straightHigh(suitMasks[s]);
      if (sf) return pack(8, [sf]);
      // Con 7 cartas o menos, un color no puede convivir con póker ni full.
      return pack(5, topRanks(suitMasks[s], 5));
    }
  }

  const groups = evaluateGroups(counts, rankMask);
  const st = straightHigh(rankMask);
  if (st) {
    const straight = pack(4, [st]);
    return groups > straight ? groups : straight;
  }
  return groups;
}

/** Mejor mano sin contar color ni escalera. */
function evaluateGroups(counts: number[], rankMask: number): number {
  const quads: number[] = [];
  const trips: number[] = [];
  const pairs: number[] = [];
  for (let r = 14; r >= 2; r--) {
    if (counts[r] === 4) quads.push(r);
    else if (counts[r] === 3) trips.push(r);
    else if (counts[r] === 2) pairs.push(r);
  }
  const without = (...rs: number[]) => rs.reduce((m, r) => m & ~(1 << r), rankMask);

  if (quads.length) return pack(7, [quads[0], ...topRanks(without(quads[0]), 1)]);
  if (trips.length && (trips.length > 1 || pairs.length)) {
    const pairRank = Math.max(trips[1] ?? 0, pairs[0] ?? 0);
    return pack(6, [trips[0], pairRank]);
  }
  if (trips.length) return pack(3, [trips[0], ...topRanks(without(trips[0]), 2)]);
  if (pairs.length >= 2) return pack(2, [pairs[0], pairs[1], ...topRanks(without(pairs[0], pairs[1]), 1)]);
  if (pairs.length === 1) return pack(1, [pairs[0], ...topRanks(without(pairs[0]), 3)]);
  return pack(0, topRanks(rankMask, 5));
}

export function categoryOf(score: number): HandCategory {
  return HAND_CATEGORIES[Math.floor(score / 16 ** 5)];
}

// ---------------------------------------------------------------------------
// Equity

/** Cartas de un jugador: 0, 1 o 2 conocidas (null = desconocida/aleatoria). */
export type HoleInput = (Card | null)[];

export interface EquityInput {
  players: HoleInput[];
  board: (Card | null)[];
}

export interface PlayerEquity {
  /** Probabilidad de ganar en solitario (0..1). */
  win: number;
  /** Probabilidad de empatar (repartir) el bote (0..1). */
  tie: number;
  /** Equity total: victorias + parte proporcional de los empates (0..1). */
  equity: number;
  /** Probabilidad de terminar con cada categoría de mano (0..1). */
  categories: number[];
}

export interface EquityResult {
  players: PlayerEquity[];
  method: 'exacto' | 'montecarlo';
  samples: number;
}

function binom(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

export const EXACT_LIMIT = 250_000;
export const DEFAULT_SAMPLES = 40_000;

/** Generador pseudoaleatorio con semilla (mulberry32) para resultados reproducibles en tests. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function validateInput(input: EquityInput): string | null {
  if (input.players.length < 2) return 'Hacen falta al menos 2 jugadores.';
  const seen = new Set<number>();
  for (const c of [...input.board, ...input.players.flat()]) {
    if (!c) continue;
    const id = cardToInt(c);
    if (seen.has(id)) return 'Hay cartas repetidas.';
    seen.add(id);
  }
  const boardKnown = input.board.filter(Boolean).length;
  if (boardKnown > 5) return 'La mesa tiene como mucho 5 cartas.';
  return null;
}

/**
 * Calcula la equity de cada jugador. Si todas las cartas de los jugadores son conocidas
 * y quedan pocas combinaciones de mesa, se enumeran todas (exacto); si no, Monte Carlo.
 */
export function calculateEquity(
  input: EquityInput,
  options: { samples?: number; random?: () => number } = {},
): EquityResult {
  const error = validateInput(input);
  if (error) throw new Error(error);

  const n = input.players.length;
  const holes = input.players.map((p) => p.filter((c): c is Card => !!c).map(cardToInt));
  const board = input.board.filter((c): c is Card => !!c).map(cardToInt);
  const used = new Set([...board, ...holes.flat()]);
  const deck: number[] = [];
  for (let c = 0; c < 52; c++) if (!used.has(c)) deck.push(c);

  const missingBoard = 5 - board.length;
  const missingHole = holes.map((h) => 2 - h.length);
  const totalMissingHole = missingHole.reduce((a, b) => a + b, 0);

  const wins = new Array<number>(n).fill(0);
  const ties = new Array<number>(n).fill(0);
  const equity = new Array<number>(n).fill(0);
  const cats = Array.from({ length: n }, () => new Array<number>(HAND_CATEGORIES.length).fill(0));
  const scores = new Array<number>(n);
  const seven = holes.map(() => new Array<number>(7));

  const showdown = (fullBoard: number[], fullHoles: number[][]) => {
    let best = -1;
    let winners = 0;
    for (let i = 0; i < n; i++) {
      const h = seven[i];
      h[0] = fullHoles[i][0];
      h[1] = fullHoles[i][1];
      for (let j = 0; j < 5; j++) h[2 + j] = fullBoard[j];
      const s = evaluate(h);
      scores[i] = s;
      cats[i][Math.floor(s / 16 ** 5)]++;
      if (s > best) {
        best = s;
        winners = 1;
      } else if (s === best) winners++;
    }
    for (let i = 0; i < n; i++) {
      if (scores[i] !== best) continue;
      if (winners === 1) wins[i]++;
      else ties[i]++;
      equity[i] += 1 / winners;
    }
  };

  let samples = 0;
  let method: EquityResult['method'];

  if (totalMissingHole === 0 && binom(deck.length, missingBoard) <= EXACT_LIMIT) {
    method = 'exacto';
    const fullBoard = [...board, 0, 0, 0, 0, 0].slice(0, 5);
    const rec = (start: number, depth: number) => {
      if (depth === missingBoard) {
        showdown(fullBoard, holes);
        samples++;
        return;
      }
      for (let i = start; i < deck.length; i++) {
        fullBoard[board.length + depth] = deck[i];
        rec(i + 1, depth + 1);
      }
    };
    rec(0, 0);
  } else {
    method = 'montecarlo';
    const random = options.random ?? Math.random;
    const target = options.samples ?? DEFAULT_SAMPLES;
    const need = missingBoard + totalMissingHole;
    const d = [...deck];
    const fullBoard = new Array<number>(5);
    const fullHoles = holes.map((h) => [h[0] ?? 0, h[1] ?? 0]);
    for (; samples < target; samples++) {
      // Fisher–Yates parcial: solo las primeras `need` posiciones
      for (let i = 0; i < need; i++) {
        const j = i + Math.floor(random() * (d.length - i));
        const t = d[i];
        d[i] = d[j];
        d[j] = t;
      }
      let k = 0;
      for (let i = 0; i < n; i++) {
        const h = holes[i];
        fullHoles[i][0] = h.length > 0 ? h[0] : d[k++];
        fullHoles[i][1] = h.length > 1 ? h[1] : d[k++];
      }
      for (let j = 0; j < 5; j++) fullBoard[j] = j < board.length ? board[j] : d[k++];
      showdown(fullBoard, fullHoles);
    }
  }

  return {
    method,
    samples,
    players: wins.map((w, i) => ({
      win: w / samples,
      tie: ties[i] / samples,
      equity: equity[i] / samples,
      categories: cats[i].map((c) => c / samples),
    })),
  };
}

/** Mano actual (con las cartas conocidas) de un jugador, si tiene al menos 5 cartas. */
export function currentHand(hole: HoleInput, board: (Card | null)[]): HandCategory | null {
  const cards = [...hole, ...board].filter((c): c is Card => !!c).map(cardToInt);
  if (cards.length < 5 || hole.filter(Boolean).length < 2) return null;
  return categoryOf(evaluate(cards));
}
