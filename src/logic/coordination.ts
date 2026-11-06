// Coordinación de la mesa según el método EducaPoker.
import { type Card, type Rank, joinEs, rankChar } from './cards';

export type Coordination =
  | 'extremadamente_coordinada'
  | 'coordinada'
  | 'semicoordinada'
  | 'seca';

/** Opciones que se muestran al usuario en el flop. */
export const FLOP_COORDINATIONS: Coordination[] = [
  'extremadamente_coordinada',
  'coordinada',
  'semicoordinada',
  'seca',
];

export const COORDINATION_LABELS: Record<Coordination, string> = {
  extremadamente_coordinada: 'Extremadamente coordinada',
  coordinada: 'Coordinada',
  semicoordinada: 'Semicoordinada',
  seca: 'Seca',
};

/** Combinaciones de escalera que no cuentan para "coordinada". */
export const STRAIGHT_EXCEPTIONS = ['96', '85', '74', '63', '52', '64', '53', '42', '54', '43', '32'];

export interface CoordinationResult {
  coordination: Coordination;
  /** Explicación en español de por qué la mesa es así. */
  reason: string;
  monotone: boolean;
  paired: boolean;
  /** Hay exactamente 2 cartas del mismo palo (proyecto de color posible). */
  flushDraw: boolean;
  /** Combinaciones de 2 rangos que hacen escalera (antes de quitar excepciones). */
  straightCombos: string[];
  /** Combinaciones de escalera válidas tras quitar excepciones. */
  validStraightCombos: string[];
  /** Detalle del cálculo de huecos (si se llegó a calcular). */
  gap?: { high: Rank; low: Rank; between: Rank[] };
}

/** ¿El conjunto de rangos contiene 5 consecutivos? (A cuenta también como 1) */
export function hasStraight(ranks: Iterable<Rank>): boolean {
  const set = new Set(ranks);
  if (set.has(14)) set.add(1);
  for (let low = 1; low <= 10; low++) {
    let ok = true;
    for (let r = low; r < low + 5; r++) {
      if (!set.has(r)) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

function comboLabel(a: Rank, b: Rank): string {
  return `${rankChar(Math.max(a, b))}${rankChar(Math.min(a, b))}`;
}

/** Todas las combinaciones de 2 rangos distintos que, con la mesa, forman escalera. */
export function straightCombos(board: Card[]): string[] {
  const boardRanks = board.map((c) => c.rank);
  const combos: string[] = [];
  for (let a = 14; a >= 2; a--) {
    for (let b = a - 1; b >= 2; b--) {
      if (hasStraight([...boardRanks, a, b])) combos.push(comboLabel(a, b));
    }
  }
  return combos;
}

function suitCounts(board: Card[]): number[] {
  const counts = new Map<string, number>();
  for (const c of board) counts.set(c.suit, (counts.get(c.suit) ?? 0) + 1);
  return [...counts.values()];
}

export function classifyBoard(board: Card[]): CoordinationResult {
  if (board.length !== 3) {
    // Preparado para el turn: allí "extremadamente coordinada" también será
    // tener un proyecto completado con UNA carta en mano.
    throw new Error('Por ahora solo se evalúa el flop (3 cartas).');
  }

  const counts = suitCounts(board);
  const monotone = counts.includes(3);
  const flushDraw = counts.includes(2);
  const distinct = new Set(board.map((c) => c.rank));
  const paired = distinct.size < board.length;

  const combos = paired ? [] : straightCombos(board);
  const valid = combos.filter((c) => !STRAIGHT_EXCEPTIONS.includes(c));
  const base = { monotone, paired, flushDraw, straightCombos: combos, validStraightCombos: valid };

  // 1.0 Extremadamente coordinada (criterio propio para el flop, ver DUDAS.md):
  // monocolor y además con escalera posible.
  if (monotone && valid.length > 0) {
    return {
      ...base,
      coordination: 'extremadamente_coordinada',
      reason: `Mesa extremadamente coordinada: es monocolor (${board[0].suit}) y además se puede tener escalera (${joinEs(valid)}); hay color, escalera e incluso escalera de color posibles.`,
    };
  }

  // 1.1 Coordinada
  if (monotone) {
    return {
      ...base,
      coordination: 'coordinada',
      reason: `Mesa coordinada: las 3 cartas son de ${board[0].suit} (monocolor), con dos cartas de ese palo ya tienes color.`,
    };
  }
  if (valid.length > 0) {
    return {
      ...base,
      coordination: 'coordinada',
      reason: `Mesa coordinada: con dos cartas se puede tener escalera (${joinEs(valid)}).`,
    };
  }

  const notes: string[] = [];
  if (paired) notes.push('una mesa emparejada nunca es coordinada en el flop');
  else if (combos.length > 0)
    notes.push(`las escaleras posibles (${joinEs(combos)}) son todas excepciones`);
  else notes.push('no hay escalera posible con dos cartas');

  // 1.2 Semicoordinada
  const remaining = [...distinct].filter((r) => r > 5).sort((a, b) => b - a);
  const ignored = [...distinct].filter((r) => r <= 5).sort((a, b) => b - a);
  if (ignored.length > 0) notes.push(`se ignoran ${joinEs(ignored.map(rankChar))}`);

  if (remaining.length < 2) {
    return {
      ...base,
      coordination: 'seca',
      reason: `Mesa seca: ${notes.join('; ')}; quedan menos de 2 cartas para medir huecos.`,
    };
  }

  let best = { high: remaining[0], low: remaining[1] };
  for (let i = 1; i < remaining.length - 1; i++) {
    const pair = { high: remaining[i], low: remaining[i + 1] };
    if (pair.high - pair.low < best.high - best.low) best = pair;
  }
  const between: Rank[] = [];
  for (let r = best.high - 1; r > best.low; r--) between.push(r);
  const limit = flushDraw ? 3 : 2;
  const gapText =
    between.length === 0
      ? `entre ${rankChar(best.high)} y ${rankChar(best.low)} no hay huecos`
      : `entre ${rankChar(best.high)} y ${rankChar(best.low)} hay ${between.length} hueco${between.length === 1 ? '' : 's'} (${joinEs(between.map(rankChar))})`;
  const colorText = flushDraw
    ? 'con proyecto de color se permiten hasta 3 huecos'
    : 'sin proyecto de color se permiten hasta 2 huecos';
  const semi = between.length <= limit;

  return {
    ...base,
    gap: { ...best, between },
    coordination: semi ? 'semicoordinada' : 'seca',
    reason: `Mesa ${semi ? 'semicoordinada' : 'seca'}: ${notes.join('; ')}; ${gapText} y ${colorText}.`,
  };
}
