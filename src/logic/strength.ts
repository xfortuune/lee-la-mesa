// Fuerza de la mano según el método EducaPoker.
import { type Card, type Rank, RANKS, rankChar } from './cards';
import { type Coordination, type CoordinationResult, classifyBoard, hasStraight } from './coordination';

export type Strength = 'muy_fuerte' | 'fuerte' | 'media' | 'debil' | 'nada';

export const STRENGTHS: Strength[] = ['muy_fuerte', 'fuerte', 'media', 'debil', 'nada'];

export const STRENGTH_LABELS: Record<Strength, string> = {
  muy_fuerte: 'Muy fuerte',
  fuerte: 'Fuerte',
  media: 'Media',
  debil: 'Débil',
  nada: 'Nada',
};

export type KickerLevel = 'mejor' | 'segundo' | 'peor';

export interface Kicker {
  rank: Rank;
  level: KickerLevel;
  best: Rank;
  second: Rank;
}

/** Jugada hecha, ya "leída" con las reglas del método (la pareja de la mesa se ignora). */
export type MadeHand =
  | { kind: 'escalera_color' }
  | { kind: 'poker' }
  | { kind: 'full' }
  | { kind: 'color' }
  | { kind: 'escalera' }
  | { kind: 'trio'; rank: Rank; set: boolean }
  | { kind: 'dobles'; high: Rank; low: Rank; best: boolean }
  | { kind: 'overpair'; rank: Rank }
  | { kind: 'pareja_maxima'; rank: Rank; kicker: Kicker }
  | { kind: 'pareja_media'; rank: Rank; kicker?: Kicker; pocket: boolean }
  | { kind: 'pareja_baja'; rank: Rank; pocket: boolean }
  | { kind: 'carta_alta_as' }
  | { kind: 'carta_alta_rey' }
  | { kind: 'nada' };

export interface StrengthResult {
  strength: Strength;
  /** Explicación en español del porqué. */
  reason: string;
  made: MadeHand;
  board: CoordinationResult;
  /** Cómo se trata la mesa para evaluar la fuerza. */
  treatedAs: 'coordinada' | 'seca';
}

function rankCounts(cards: Card[]): Map<Rank, number> {
  const m = new Map<Rank, number>();
  for (const c of cards) m.set(c.rank, (m.get(c.rank) ?? 0) + 1);
  return m;
}

/** Mejor y segundo mejor apoyo: rangos más altos que no están en la mesa ni son el de la pareja. */
export function kickerFor(pairRank: Rank, kickerRank: Rank, boardRanks: Rank[]): Kicker {
  const ladder = [...RANKS]
    .reverse()
    .filter((r) => r !== pairRank && !boardRanks.includes(r));
  const [best, second] = ladder;
  const level: KickerLevel = kickerRank === best ? 'mejor' : kickerRank === second ? 'segundo' : 'peor';
  return { rank: kickerRank, level, best, second };
}

export function readMadeHand(hole: Card[], board: Card[]): MadeHand {
  const all = [...hole, ...board];
  const counts = rankCounts(all);
  const countValues = [...counts.values()];
  const flush = all.every((c) => c.suit === all[0].suit);
  const straight = counts.size === 5 && hasStraight(counts.keys());

  if (flush && straight) return { kind: 'escalera_color' };
  if (countValues.includes(4)) return { kind: 'poker' };
  if (countValues.includes(3) && countValues.includes(2)) return { kind: 'full' };
  if (flush) return { kind: 'color' };
  if (straight) return { kind: 'escalera' };

  // A partir de aquí se ignora la pareja (o trío) de la mesa.
  const boardCounts = rankCounts(board);
  const D = [...boardCounts.keys()].sort((a, b) => b - a); // rangos distintos de la mesa
  const [h1, h2] = hole.map((c) => c.rank);

  if (h1 === h2) {
    if (D.includes(h1)) return { kind: 'trio', rank: h1, set: true };
    if (h1 > D[0]) return { kind: 'overpair', rank: h1 };
    if (D.length > 1 && h1 > D[1]) return { kind: 'pareja_media', rank: h1, pocket: true };
    return { kind: 'pareja_baja', rank: h1, pocket: true };
  }

  // Trío con la pareja de la mesa.
  for (const h of [h1, h2]) {
    if (boardCounts.get(h) === 2) return { kind: 'trio', rank: h, set: false };
  }

  if (D.includes(h1) && D.includes(h2)) {
    const high = Math.max(h1, h2);
    const low = Math.min(h1, h2);
    return { kind: 'dobles', high, low, best: high === D[0] && low === D[1] };
  }

  const pairIdx = D.findIndex((r) => r === h1 || r === h2);
  if (pairIdx >= 0) {
    const rank = D[pairIdx];
    const kickerRank = rank === h1 ? h2 : h1;
    const kicker = kickerFor(rank, kickerRank, D);
    if (pairIdx === 0) return { kind: 'pareja_maxima', rank, kicker };
    if (pairIdx === 1) return { kind: 'pareja_media', rank, kicker, pocket: false };
    return { kind: 'pareja_baja', rank, pocket: false };
  }

  if (h1 === 14 || h2 === 14) return { kind: 'carta_alta_as' };
  if (D.includes(14) && (h1 === 13 || h2 === 13)) return { kind: 'carta_alta_rey' };
  return { kind: 'nada' };
}

function kickerText(k: Kicker): string {
  if (k.level === 'mejor') return `con el mejor apoyo (${rankChar(k.rank)})`;
  if (k.level === 'segundo') return `con el segundo mejor apoyo (${rankChar(k.rank)})`;
  return `con apoyo ${rankChar(k.rank)} (peor que el segundo mejor, ${rankChar(k.second)})`;
}

export function describeMade(made: MadeHand): string {
  switch (made.kind) {
    case 'escalera_color':
      return 'escalera de color';
    case 'poker':
      return 'póker';
    case 'full':
      return 'full';
    case 'color':
      return 'color';
    case 'escalera':
      return 'escalera';
    case 'trio':
      return made.set ? `trío de ${rankChar(made.rank)} (set)` : `trío de ${rankChar(made.rank)}`;
    case 'dobles':
      return `${made.best ? 'las mejores dobles parejas' : 'dobles parejas'} (${rankChar(made.high)} y ${rankChar(made.low)})`;
    case 'overpair':
      return `overpair de ${rankChar(made.rank)}`;
    case 'pareja_maxima':
      return `pareja máxima de ${rankChar(made.rank)} ${kickerText(made.kicker)}`;
    case 'pareja_media':
      if (made.pocket)
        return `pareja de ${rankChar(made.rank)} en mano entre las dos cartas más altas (cuenta como pareja media con el mejor apoyo)`;
      return `pareja media de ${rankChar(made.rank)} ${kickerText(made.kicker!)}`;
    case 'pareja_baja':
      return made.pocket
        ? `pareja de ${rankChar(made.rank)} en mano por debajo de la segunda carta (cuenta como pareja baja)`
        : `pareja baja de ${rankChar(made.rank)}`;
    case 'carta_alta_as':
      return 'carta alta As';
    case 'carta_alta_rey':
      return 'carta alta Rey con As en mesa';
    case 'nada':
      return 'nada';
  }
}

function strengthOnCoordinated(made: MadeHand, monotone: boolean): { s: Strength; why?: string } {
  switch (made.kind) {
    case 'escalera_color':
      return { s: 'muy_fuerte' };
    case 'color':
      return { s: 'muy_fuerte', why: 'en mesa monocolor el color es lo máximo' };
    case 'escalera':
      return monotone
        ? { s: 'fuerte', why: 'en mesa monocolor la escalera no es lo máximo' }
        : { s: 'muy_fuerte' };
    case 'poker':
    case 'full':
    case 'trio':
    case 'dobles':
      return { s: 'fuerte', why: 'al menos dobles parejas' };
    case 'overpair':
    case 'pareja_maxima':
      return { s: 'media' };
    case 'pareja_media':
    case 'pareja_baja':
    case 'carta_alta_as':
    case 'carta_alta_rey':
      return { s: 'debil', why: 'por debajo de pareja máxima pero al menos carta alta As' };
    case 'nada':
      return { s: 'nada' };
  }
}

function strengthOnDry(made: MadeHand, paired: boolean): { s: Strength; why?: string } {
  switch (made.kind) {
    case 'escalera_color':
    case 'poker':
    case 'full':
    case 'color':
    case 'escalera':
      return { s: 'muy_fuerte' };
    case 'trio':
      return paired
        ? { s: 'fuerte', why: 'en mesa emparejada el trío es fuerte; solo el full es muy fuerte' }
        : { s: 'muy_fuerte' };
    case 'dobles':
      return made.best ? { s: 'muy_fuerte' } : { s: 'fuerte', why: 'no son las mejores dobles parejas' };
    case 'overpair':
      return { s: 'fuerte' };
    case 'pareja_maxima':
      if (paired)
        return {
          s: 'fuerte',
          why: 'en mesa emparejada la pareja máxima se trata como fuerte sea cual sea el apoyo (criterio provisional, ver DUDAS.md)',
        };
      return made.kicker.level === 'peor'
        ? { s: 'media', why: 'pareja máxima con apoyo peor que el segundo mejor' }
        : { s: 'fuerte' };
    case 'pareja_media':
      return made.pocket || made.kicker!.level !== 'peor'
        ? { s: 'media' }
        : { s: 'debil', why: 'peor que pareja media con el segundo mejor apoyo' };
    case 'pareja_baja':
    case 'carta_alta_as':
    case 'carta_alta_rey':
      return { s: 'debil', why: 'peor que pareja media con el segundo mejor apoyo, pero al menos carta alta As' };
    case 'nada':
      return { s: 'nada' };
  }
}

function boardName(c: Coordination, paired: boolean): string {
  if (c === 'extremadamente_coordinada') return 'mesa extremadamente coordinada (se evalúa como coordinada)';
  if (c === 'coordinada') return 'mesa coordinada';
  const base = c === 'semicoordinada' ? 'mesa semicoordinada (se evalúa como seca)' : 'mesa seca';
  return paired ? `${base} y emparejada` : base;
}

export function evaluateHand(hole: Card[], board: Card[]): StrengthResult {
  if (hole.length !== 2) throw new Error('Se necesitan 2 cartas en mano.');
  const boardInfo = classifyBoard(board);
  const made = readMadeHand(hole, board);
  const treatedAs =
    boardInfo.coordination === 'coordinada' || boardInfo.coordination === 'extremadamente_coordinada'
      ? 'coordinada'
      : 'seca';
  const { s, why } =
    treatedAs === 'coordinada'
      ? strengthOnCoordinated(made, boardInfo.monotone)
      : strengthOnDry(made, boardInfo.paired);

  const ignoredPair = boardInfo.paired && !['poker', 'full', 'trio'].includes(made.kind)
    ? ' (ignorando la pareja de la mesa)'
    : '';
  const what =
    made.kind === 'nada'
      ? 'No has ligado nada (ni pareja, ni As, ni Rey con As en mesa)'
      : `Tienes ${describeMade(made)}${ignoredPair}`;
  const verdict = s === 'nada' ? 'nada' : `mano ${STRENGTH_LABELS[s].toLowerCase()}`;
  const reason =
    `${what} en ${boardName(boardInfo.coordination, boardInfo.paired)}` +
    `${why ? ` — ${why}` : ''} → ${verdict}.`;

  return { strength: s, reason, made, board: boardInfo, treatedAs };
}
