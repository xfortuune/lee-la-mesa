// Coordinación de la mesa según el método EducaPoker.
import type { Lang } from '../i18n/lang';
import { type Card, type Rank, joinList, rankChar } from './cards';

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

export const COORDINATION_LABELS: Record<Lang, Record<Coordination, string>> = {
  es: {
    extremadamente_coordinada: 'Extremadamente coordinada',
    coordinada: 'Coordinada',
    semicoordinada: 'Semicoordinada',
    seca: 'Seca',
  },
  en: {
    extremadamente_coordinada: 'Extremely coordinated',
    coordinada: 'Coordinated',
    semicoordinada: 'Semi-coordinated',
    seca: 'Dry',
  },
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

/** Clasifica el flop. `lang` solo afecta al texto de la explicación. */
export function classifyBoard(board: Card[], lang: Lang = 'es'): CoordinationResult {
  const en = lang === 'en';
  const join = (items: string[]) => joinList(items, lang);
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
      reason: en
        ? `Extremely coordinated board: it is monotone (${board[0].suit}) and a straight is also possible (${join(valid)}); flushes, straights and even straight flushes are possible.`
        : `Mesa extremadamente coordinada: es monocolor (${board[0].suit}) y además se puede tener escalera (${join(valid)}); hay color, escalera e incluso escalera de color posibles.`,
    };
  }

  // 1.1 Coordinada
  if (monotone) {
    return {
      ...base,
      coordination: 'coordinada',
      reason: en
        ? `Coordinated board: all 3 cards are ${board[0].suit} (monotone), so any two cards of that suit make a flush.`
        : `Mesa coordinada: las 3 cartas son de ${board[0].suit} (monocolor), con dos cartas de ese palo ya tienes color.`,
    };
  }
  if (valid.length > 0) {
    return {
      ...base,
      coordination: 'coordinada',
      reason: en
        ? `Coordinated board: two cards can make a straight (${join(valid)}).`
        : `Mesa coordinada: con dos cartas se puede tener escalera (${join(valid)}).`,
    };
  }

  const notes: string[] = [];
  if (paired) notes.push(en ? 'a paired board is never coordinated on the flop' : 'una mesa emparejada nunca es coordinada en el flop');
  else if (combos.length > 0)
    notes.push(
      en
        ? `the possible straights (${join(combos)}) are all exceptions`
        : `las escaleras posibles (${join(combos)}) son todas excepciones`,
    );
  else notes.push(en ? 'no straight is possible with two cards' : 'no hay escalera posible con dos cartas');

  // 1.2 Semicoordinada
  const remaining = [...distinct].filter((r) => r > 5).sort((a, b) => b - a);
  const ignored = [...distinct].filter((r) => r <= 5).sort((a, b) => b - a);
  if (ignored.length > 0)
    notes.push(en ? `${join(ignored.map(rankChar))} ${ignored.length === 1 ? 'is' : 'are'} ignored` : `se ignoran ${join(ignored.map(rankChar))}`);

  if (remaining.length < 2) {
    return {
      ...base,
      coordination: 'seca',
      reason: en
        ? `Dry board: ${notes.join('; ')}; fewer than 2 cards are left to measure gaps.`
        : `Mesa seca: ${notes.join('; ')}; quedan menos de 2 cartas para medir huecos.`,
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
  const hi = rankChar(best.high);
  const lo = rankChar(best.low);
  const n = between.length;
  const gapList = join(between.map(rankChar));
  const gapText = en
    ? n === 0
      ? `there are no gaps between ${hi} and ${lo}`
      : `between ${hi} and ${lo} there ${n === 1 ? 'is' : 'are'} ${n} gap${n === 1 ? '' : 's'} (${gapList})`
    : n === 0
      ? `entre ${hi} y ${lo} no hay huecos`
      : `entre ${hi} y ${lo} hay ${n} hueco${n === 1 ? '' : 's'} (${gapList})`;
  const colorText = en
    ? flushDraw
      ? 'with a flush draw up to 3 gaps are allowed'
      : 'without a flush draw up to 2 gaps are allowed'
    : flushDraw
      ? 'con proyecto de color se permiten hasta 3 huecos'
      : 'sin proyecto de color se permiten hasta 2 huecos';
  const semi = between.length <= limit;

  return {
    ...base,
    gap: { ...best, between },
    coordination: semi ? 'semicoordinada' : 'seca',
    reason: en
      ? `${semi ? 'Semi-coordinated' : 'Dry'} board: ${notes.join('; ')}; ${gapText}, and ${colorText}.`
      : `Mesa ${semi ? 'semicoordinada' : 'seca'}: ${notes.join('; ')}; ${gapText} y ${colorText}.`,
  };
}
