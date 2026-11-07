// Fuerza de la mano según el método EducaPoker.
import type { Lang } from '../i18n/lang';
import { type Card, type Rank, RANKS, rankChar } from './cards';
import { type Coordination, type CoordinationResult, classifyBoard, hasStraight } from './coordination';

export type Strength = 'muy_fuerte' | 'fuerte' | 'media' | 'debil' | 'nada';

export const STRENGTHS: Strength[] = ['muy_fuerte', 'fuerte', 'media', 'debil', 'nada'];

export const STRENGTH_LABELS: Record<Lang, Record<Strength, string>> = {
  es: { muy_fuerte: 'Muy fuerte', fuerte: 'Fuerte', media: 'Media', debil: 'Débil', nada: 'Nada' },
  en: { muy_fuerte: 'Very strong', fuerte: 'Strong', media: 'Medium', debil: 'Weak', nada: 'Nothing' },
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

function kickerText(k: Kicker, lang: Lang): string {
  const r = rankChar(k.rank);
  if (lang === 'en') {
    if (k.level === 'mejor') return `with the best kicker (${r})`;
    if (k.level === 'segundo') return `with the second-best kicker (${r})`;
    return `with a ${r} kicker (worse than the second best, ${rankChar(k.second)})`;
  }
  if (k.level === 'mejor') return `con el mejor apoyo (${r})`;
  if (k.level === 'segundo') return `con el segundo mejor apoyo (${r})`;
  return `con apoyo ${r} (peor que el segundo mejor, ${rankChar(k.second)})`;
}

export function describeMade(made: MadeHand, lang: Lang = 'es'): string {
  const en = lang === 'en';
  switch (made.kind) {
    case 'escalera_color':
      return en ? 'a straight flush' : 'escalera de color';
    case 'poker':
      return en ? 'four of a kind' : 'póker';
    case 'full':
      return en ? 'a full house' : 'full';
    case 'color':
      return en ? 'a flush' : 'color';
    case 'escalera':
      return en ? 'a straight' : 'escalera';
    case 'trio': {
      const r = rankChar(made.rank);
      if (en) return made.set ? `a set of ${r}s` : `trips (${r}s)`;
      return made.set ? `trío de ${r} (set)` : `trío de ${r}`;
    }
    case 'dobles': {
      const hi = rankChar(made.high);
      const lo = rankChar(made.low);
      if (en) return `${made.best ? 'the best two pair' : 'two pair'} (${hi} and ${lo})`;
      return `${made.best ? 'las mejores dobles parejas' : 'dobles parejas'} (${hi} y ${lo})`;
    }
    case 'overpair':
      return en ? `an overpair (${rankChar(made.rank)}s)` : `overpair de ${rankChar(made.rank)}`;
    case 'pareja_maxima':
      return en
        ? `top pair (${rankChar(made.rank)}s) ${kickerText(made.kicker, lang)}`
        : `pareja máxima de ${rankChar(made.rank)} ${kickerText(made.kicker, lang)}`;
    case 'pareja_media':
      if (made.pocket)
        return en
          ? `a pocket pair of ${rankChar(made.rank)}s between the two highest board cards (counts as middle pair with the best kicker)`
          : `pareja de ${rankChar(made.rank)} en mano entre las dos cartas más altas (cuenta como pareja media con el mejor apoyo)`;
      return en
        ? `middle pair (${rankChar(made.rank)}s) ${kickerText(made.kicker!, lang)}`
        : `pareja media de ${rankChar(made.rank)} ${kickerText(made.kicker!, lang)}`;
    case 'pareja_baja':
      if (made.pocket)
        return en
          ? `a pocket pair of ${rankChar(made.rank)}s below the second board card (counts as bottom pair)`
          : `pareja de ${rankChar(made.rank)} en mano por debajo de la segunda carta (cuenta como pareja baja)`;
      return en ? `bottom pair (${rankChar(made.rank)}s)` : `pareja baja de ${rankChar(made.rank)}`;
    case 'carta_alta_as':
      return en ? 'ace high' : 'carta alta As';
    case 'carta_alta_rey':
      return en ? 'king high with an ace on the board' : 'carta alta Rey con As en mesa';
    case 'nada':
      return en ? 'nothing' : 'nada';
  }
}

/** Motivos que acompañan a la categoría, en los dos idiomas. */
type Why =
  | 'monotoneFlush'
  | 'monotoneStraight'
  | 'atLeastTwoPair'
  | 'belowTopPair'
  | 'pairedTrips'
  | 'notBestTwoPair'
  | 'pairedTopPair'
  | 'topPairBadKicker'
  | 'middleBadKicker'
  | 'belowMiddle';

const WHY: Record<Lang, Record<Why, string>> = {
  es: {
    monotoneFlush: 'en mesa monocolor el color es lo máximo',
    monotoneStraight: 'en mesa monocolor la escalera no es lo máximo',
    atLeastTwoPair: 'al menos dobles parejas',
    belowTopPair: 'por debajo de pareja máxima pero al menos carta alta As',
    pairedTrips: 'en mesa emparejada el trío es fuerte; solo el full es muy fuerte',
    notBestTwoPair: 'no son las mejores dobles parejas',
    pairedTopPair:
      'en mesa emparejada la pareja máxima se trata como fuerte sea cual sea el apoyo (criterio provisional, ver DUDAS.md)',
    topPairBadKicker: 'pareja máxima con apoyo peor que el segundo mejor',
    middleBadKicker: 'peor que pareja media con el segundo mejor apoyo',
    belowMiddle: 'peor que pareja media con el segundo mejor apoyo, pero al menos carta alta As',
  },
  en: {
    monotoneFlush: 'on a monotone board a flush is the top hand',
    monotoneStraight: 'on a monotone board a straight is not the top hand',
    atLeastTwoPair: 'at least two pair',
    belowTopPair: 'below top pair but at least ace high',
    pairedTrips: 'on a paired board trips are strong; only a full house is very strong',
    notBestTwoPair: 'not the best possible two pair',
    pairedTopPair: 'on a paired board top pair counts as strong whatever the kicker (provisional rule)',
    topPairBadKicker: 'top pair with a kicker worse than the second best',
    middleBadKicker: 'worse than middle pair with the second-best kicker',
    belowMiddle: 'worse than middle pair with the second-best kicker, but at least ace high',
  },
};

function strengthOnCoordinated(made: MadeHand, monotone: boolean): { s: Strength; why?: Why } {
  switch (made.kind) {
    case 'escalera_color':
      return { s: 'muy_fuerte' };
    case 'color':
      return { s: 'muy_fuerte', why: 'monotoneFlush' };
    case 'escalera':
      return monotone ? { s: 'fuerte', why: 'monotoneStraight' } : { s: 'muy_fuerte' };
    case 'poker':
    case 'full':
    case 'trio':
    case 'dobles':
      return { s: 'fuerte', why: 'atLeastTwoPair' };
    case 'overpair':
    case 'pareja_maxima':
      return { s: 'media' };
    case 'pareja_media':
    case 'pareja_baja':
    case 'carta_alta_as':
    case 'carta_alta_rey':
      return { s: 'debil', why: 'belowTopPair' };
    case 'nada':
      return { s: 'nada' };
  }
}

function strengthOnDry(made: MadeHand, paired: boolean): { s: Strength; why?: Why } {
  switch (made.kind) {
    case 'escalera_color':
    case 'poker':
    case 'full':
    case 'color':
    case 'escalera':
      return { s: 'muy_fuerte' };
    case 'trio':
      return paired ? { s: 'fuerte', why: 'pairedTrips' } : { s: 'muy_fuerte' };
    case 'dobles':
      return made.best ? { s: 'muy_fuerte' } : { s: 'fuerte', why: 'notBestTwoPair' };
    case 'overpair':
      return { s: 'fuerte' };
    case 'pareja_maxima':
      if (paired) return { s: 'fuerte', why: 'pairedTopPair' };
      return made.kicker.level === 'peor' ? { s: 'media', why: 'topPairBadKicker' } : { s: 'fuerte' };
    case 'pareja_media':
      return made.pocket || made.kicker!.level !== 'peor' ? { s: 'media' } : { s: 'debil', why: 'middleBadKicker' };
    case 'pareja_baja':
    case 'carta_alta_as':
    case 'carta_alta_rey':
      return { s: 'debil', why: 'belowMiddle' };
    case 'nada':
      return { s: 'nada' };
  }
}

function boardName(c: Coordination, paired: boolean, lang: Lang): string {
  if (lang === 'en') {
    if (c === 'extremadamente_coordinada') return 'an extremely coordinated board (evaluated as coordinated)';
    if (c === 'coordinada') return 'a coordinated board';
    const base = c === 'semicoordinada' ? 'a semi-coordinated board (evaluated as dry)' : 'a dry board';
    return paired ? `${base}, paired` : base;
  }
  if (c === 'extremadamente_coordinada') return 'mesa extremadamente coordinada (se evalúa como coordinada)';
  if (c === 'coordinada') return 'mesa coordinada';
  const base = c === 'semicoordinada' ? 'mesa semicoordinada (se evalúa como seca)' : 'mesa seca';
  return paired ? `${base} y emparejada` : base;
}

/** Evalúa la fuerza de la mano. `lang` solo afecta a los textos de la explicación. */
export function evaluateHand(hole: Card[], board: Card[], lang: Lang = 'es'): StrengthResult {
  if (hole.length !== 2) throw new Error('Se necesitan 2 cartas en mano.');
  const en = lang === 'en';
  const boardInfo = classifyBoard(board, lang);
  const made = readMadeHand(hole, board);
  const treatedAs =
    boardInfo.coordination === 'coordinada' || boardInfo.coordination === 'extremadamente_coordinada'
      ? 'coordinada'
      : 'seca';
  const { s, why } =
    treatedAs === 'coordinada'
      ? strengthOnCoordinated(made, boardInfo.monotone)
      : strengthOnDry(made, boardInfo.paired);

  const ignoresPair = boardInfo.paired && !['poker', 'full', 'trio'].includes(made.kind);
  const ignoredPair = ignoresPair ? (en ? ' (ignoring the board pair)' : ' (ignorando la pareja de la mesa)') : '';
  const what =
    made.kind === 'nada'
      ? en
        ? 'You have nothing (no pair, no ace, no king with an ace on the board)'
        : 'No has ligado nada (ni pareja, ni As, ni Rey con As en mesa)'
      : `${en ? 'You have' : 'Tienes'} ${describeMade(made, lang)}${ignoredPair}`;
  const label = STRENGTH_LABELS[lang][s].toLowerCase();
  const verdict = en ? (s === 'nada' ? 'nothing' : `${label} hand`) : s === 'nada' ? 'nada' : `mano ${label}`;
  const reason =
    `${what} ${en ? 'on' : 'en'} ${boardName(boardInfo.coordination, boardInfo.paired, lang)}` +
    `${why ? ` — ${WHY[lang][why]}` : ''} → ${verdict}.`;

  return { strength: s, reason, made, board: boardInfo, treatedAs };
}
