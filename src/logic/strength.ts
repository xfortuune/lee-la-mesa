// Hand strength following the EducaPoker method.
import type { Lang } from '../i18n/lang';
import { type Card, type Rank, RANKS, rankChar } from './cards';
import { type Coordination, type CoordinationResult, classifyBoard, hasStraight } from './coordination';

export type Strength = 'very_strong' | 'strong' | 'medium' | 'weak' | 'nothing';

export const STRENGTHS: Strength[] = ['very_strong', 'strong', 'medium', 'weak', 'nothing'];

export const STRENGTH_LABELS: Record<Lang, Record<Strength, string>> = {
  en: { very_strong: 'Very strong', strong: 'Strong', medium: 'Medium', weak: 'Weak', nothing: 'Nothing' },
  es: { very_strong: 'Muy fuerte', strong: 'Fuerte', medium: 'Media', weak: 'Débil', nothing: 'Nada' },
};

export type KickerLevel = 'best' | 'second' | 'worse';

export interface Kicker {
  rank: Rank;
  level: KickerLevel;
  best: Rank;
  second: Rank;
}

/** A made hand, already "read" with the method's rules (the board pair is ignored). */
export type MadeHand =
  | { kind: 'straight_flush' }
  | { kind: 'quads' }
  | { kind: 'full_house' }
  | { kind: 'flush' }
  | { kind: 'straight' }
  | { kind: 'trips'; rank: Rank; set: boolean }
  | { kind: 'two_pair'; high: Rank; low: Rank; best: boolean }
  | { kind: 'overpair'; rank: Rank }
  | { kind: 'top_pair'; rank: Rank; kicker: Kicker }
  | { kind: 'middle_pair'; rank: Rank; kicker?: Kicker; pocket: boolean }
  | { kind: 'bottom_pair'; rank: Rank; pocket: boolean }
  | { kind: 'ace_high' }
  | { kind: 'king_high' }
  | { kind: 'nothing' };

export interface StrengthResult {
  strength: Strength;
  /** Explanation of why. */
  reason: string;
  made: MadeHand;
  board: CoordinationResult;
  /** How the board is treated when rating strength. */
  treatedAs: 'coordinated' | 'dry';
}

function rankCounts(cards: Card[]): Map<Rank, number> {
  const m = new Map<Rank, number>();
  for (const c of cards) m.set(c.rank, (m.get(c.rank) ?? 0) + 1);
  return m;
}

/** Best and second-best kicker: the highest ranks that are neither on the board nor the pair's rank. */
export function kickerFor(pairRank: Rank, kickerRank: Rank, boardRanks: Rank[]): Kicker {
  const ladder = [...RANKS].reverse().filter((r) => r !== pairRank && !boardRanks.includes(r));
  const [best, second] = ladder;
  const level: KickerLevel = kickerRank === best ? 'best' : kickerRank === second ? 'second' : 'worse';
  return { rank: kickerRank, level, best, second };
}

export function readMadeHand(hole: Card[], board: Card[]): MadeHand {
  const all = [...hole, ...board];
  const counts = rankCounts(all);
  const countValues = [...counts.values()];
  const flush = all.every((c) => c.suit === all[0].suit);
  const straight = counts.size === 5 && hasStraight(counts.keys());

  if (flush && straight) return { kind: 'straight_flush' };
  if (countValues.includes(4)) return { kind: 'quads' };
  if (countValues.includes(3) && countValues.includes(2)) return { kind: 'full_house' };
  if (flush) return { kind: 'flush' };
  if (straight) return { kind: 'straight' };

  // From here on the board pair (or trips) is ignored.
  const boardCounts = rankCounts(board);
  const D = [...boardCounts.keys()].sort((a, b) => b - a); // distinct board ranks
  const [h1, h2] = hole.map((c) => c.rank);

  if (h1 === h2) {
    if (D.includes(h1)) return { kind: 'trips', rank: h1, set: true };
    if (h1 > D[0]) return { kind: 'overpair', rank: h1 };
    if (D.length > 1 && h1 > D[1]) return { kind: 'middle_pair', rank: h1, pocket: true };
    return { kind: 'bottom_pair', rank: h1, pocket: true };
  }

  // Trips using the board pair.
  for (const h of [h1, h2]) {
    if (boardCounts.get(h) === 2) return { kind: 'trips', rank: h, set: false };
  }

  if (D.includes(h1) && D.includes(h2)) {
    const high = Math.max(h1, h2);
    const low = Math.min(h1, h2);
    return { kind: 'two_pair', high, low, best: high === D[0] && low === D[1] };
  }

  const pairIdx = D.findIndex((r) => r === h1 || r === h2);
  if (pairIdx >= 0) {
    const rank = D[pairIdx];
    const kickerRank = rank === h1 ? h2 : h1;
    const kicker = kickerFor(rank, kickerRank, D);
    if (pairIdx === 0) return { kind: 'top_pair', rank, kicker };
    if (pairIdx === 1) return { kind: 'middle_pair', rank, kicker, pocket: false };
    return { kind: 'bottom_pair', rank, pocket: false };
  }

  if (h1 === 14 || h2 === 14) return { kind: 'ace_high' };
  if (D.includes(14) && (h1 === 13 || h2 === 13)) return { kind: 'king_high' };
  return { kind: 'nothing' };
}

function kickerText(k: Kicker, lang: Lang): string {
  const r = rankChar(k.rank);
  if (lang === 'en') {
    if (k.level === 'best') return `with the best kicker (${r})`;
    if (k.level === 'second') return `with the second-best kicker (${r})`;
    return `with a ${r} kicker (worse than the second best, ${rankChar(k.second)})`;
  }
  if (k.level === 'best') return `con el mejor apoyo (${r})`;
  if (k.level === 'second') return `con el segundo mejor apoyo (${r})`;
  return `con apoyo ${r} (peor que el segundo mejor, ${rankChar(k.second)})`;
}

export function describeMade(made: MadeHand, lang: Lang = 'en'): string {
  const en = lang === 'en';
  switch (made.kind) {
    case 'straight_flush':
      return en ? 'a straight flush' : 'escalera de color';
    case 'quads':
      return en ? 'four of a kind' : 'póker';
    case 'full_house':
      return en ? 'a full house' : 'full';
    case 'flush':
      return en ? 'a flush' : 'color';
    case 'straight':
      return en ? 'a straight' : 'escalera';
    case 'trips': {
      const r = rankChar(made.rank);
      if (en) return made.set ? `a set of ${r}s` : `trips (${r}s)`;
      return made.set ? `trío de ${r} (set)` : `trío de ${r}`;
    }
    case 'two_pair': {
      const hi = rankChar(made.high);
      const lo = rankChar(made.low);
      if (en) return `${made.best ? 'the best two pair' : 'two pair'} (${hi} and ${lo})`;
      return `${made.best ? 'las mejores dobles parejas' : 'dobles parejas'} (${hi} y ${lo})`;
    }
    case 'overpair':
      return en ? `an overpair (${rankChar(made.rank)}s)` : `overpair de ${rankChar(made.rank)}`;
    case 'top_pair':
      return en
        ? `top pair (${rankChar(made.rank)}s) ${kickerText(made.kicker, lang)}`
        : `pareja máxima de ${rankChar(made.rank)} ${kickerText(made.kicker, lang)}`;
    case 'middle_pair':
      if (made.pocket)
        return en
          ? `a pocket pair of ${rankChar(made.rank)}s between the two highest board cards (counts as middle pair with the best kicker)`
          : `pareja de ${rankChar(made.rank)} en mano entre las dos cartas más altas (cuenta como pareja media con el mejor apoyo)`;
      return en
        ? `middle pair (${rankChar(made.rank)}s) ${kickerText(made.kicker!, lang)}`
        : `pareja media de ${rankChar(made.rank)} ${kickerText(made.kicker!, lang)}`;
    case 'bottom_pair':
      if (made.pocket)
        return en
          ? `a pocket pair of ${rankChar(made.rank)}s below the second board card (counts as bottom pair)`
          : `pareja de ${rankChar(made.rank)} en mano por debajo de la segunda carta (cuenta como pareja baja)`;
      return en ? `bottom pair (${rankChar(made.rank)}s)` : `pareja baja de ${rankChar(made.rank)}`;
    case 'ace_high':
      return en ? 'ace high' : 'carta alta As';
    case 'king_high':
      return en ? 'king high with an ace on the board' : 'carta alta Rey con As en mesa';
    case 'nothing':
      return en ? 'nothing' : 'nada';
  }
}

/** Reasons shown next to the category, in both languages. */
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
  es: {
    monotoneFlush: 'en mesa monocolor el color es lo máximo',
    monotoneStraight: 'en mesa monocolor la escalera no es lo máximo',
    atLeastTwoPair: 'al menos dobles parejas',
    belowTopPair: 'por debajo de pareja máxima pero al menos carta alta As',
    pairedTrips: 'en mesa emparejada el trío es fuerte; solo el full es muy fuerte',
    notBestTwoPair: 'no son las mejores dobles parejas',
    pairedTopPair: 'en mesa emparejada la pareja máxima se trata como fuerte sea cual sea el apoyo (criterio provisional)',
    topPairBadKicker: 'pareja máxima con apoyo peor que el segundo mejor',
    middleBadKicker: 'peor que pareja media con el segundo mejor apoyo',
    belowMiddle: 'peor que pareja media con el segundo mejor apoyo, pero al menos carta alta As',
  },
};

function strengthOnCoordinated(made: MadeHand, monotone: boolean): { s: Strength; why?: Why } {
  switch (made.kind) {
    case 'straight_flush':
      return { s: 'very_strong' };
    case 'flush':
      return { s: 'very_strong', why: 'monotoneFlush' };
    case 'straight':
      return monotone ? { s: 'strong', why: 'monotoneStraight' } : { s: 'very_strong' };
    case 'quads':
    case 'full_house':
    case 'trips':
    case 'two_pair':
      return { s: 'strong', why: 'atLeastTwoPair' };
    case 'overpair':
    case 'top_pair':
      return { s: 'medium' };
    case 'middle_pair':
    case 'bottom_pair':
    case 'ace_high':
    case 'king_high':
      return { s: 'weak', why: 'belowTopPair' };
    case 'nothing':
      return { s: 'nothing' };
  }
}

function strengthOnDry(made: MadeHand, paired: boolean): { s: Strength; why?: Why } {
  switch (made.kind) {
    case 'straight_flush':
    case 'quads':
    case 'full_house':
    case 'flush':
    case 'straight':
      return { s: 'very_strong' };
    case 'trips':
      return paired ? { s: 'strong', why: 'pairedTrips' } : { s: 'very_strong' };
    case 'two_pair':
      return made.best ? { s: 'very_strong' } : { s: 'strong', why: 'notBestTwoPair' };
    case 'overpair':
      return { s: 'strong' };
    case 'top_pair':
      if (paired) return { s: 'strong', why: 'pairedTopPair' };
      return made.kicker.level === 'worse' ? { s: 'medium', why: 'topPairBadKicker' } : { s: 'strong' };
    case 'middle_pair':
      return made.pocket || made.kicker!.level !== 'worse'
        ? { s: 'medium' }
        : { s: 'weak', why: 'middleBadKicker' };
    case 'bottom_pair':
    case 'ace_high':
    case 'king_high':
      return { s: 'weak', why: 'belowMiddle' };
    case 'nothing':
      return { s: 'nothing' };
  }
}

function boardName(c: Coordination, paired: boolean, lang: Lang): string {
  if (lang === 'en') {
    if (c === 'extreme') return 'an extremely coordinated board (evaluated as coordinated)';
    if (c === 'coordinated') return 'a coordinated board';
    const base = c === 'semi' ? 'a semi-coordinated board (evaluated as dry)' : 'a dry board';
    return paired ? `${base}, paired` : base;
  }
  if (c === 'extreme') return 'mesa extremadamente coordinada (se evalúa como coordinada)';
  if (c === 'coordinated') return 'mesa coordinada';
  const base = c === 'semi' ? 'mesa semicoordinada (se evalúa como seca)' : 'mesa seca';
  return paired ? `${base} y emparejada` : base;
}

/** Rates the hand strength. `lang` only affects the wording of the explanation. */
export function evaluateHand(hole: Card[], board: Card[], lang: Lang = 'en'): StrengthResult {
  if (hole.length !== 2) throw new Error('Two hole cards are required.');
  const en = lang === 'en';
  const boardInfo = classifyBoard(board, lang);
  const made = readMadeHand(hole, board);
  const treatedAs =
    boardInfo.coordination === 'coordinated' || boardInfo.coordination === 'extreme' ? 'coordinated' : 'dry';
  const { s, why } =
    treatedAs === 'coordinated'
      ? strengthOnCoordinated(made, boardInfo.monotone)
      : strengthOnDry(made, boardInfo.paired);

  const ignoresPair = boardInfo.paired && !['quads', 'full_house', 'trips'].includes(made.kind);
  const ignoredPair = ignoresPair ? (en ? ' (ignoring the board pair)' : ' (ignorando la pareja de la mesa)') : '';
  const what =
    made.kind === 'nothing'
      ? en
        ? 'You have nothing (no pair, no ace, no king with an ace on the board)'
        : 'No has ligado nada (ni pareja, ni As, ni Rey con As en mesa)'
      : `${en ? 'You have' : 'Tienes'} ${describeMade(made, lang)}${ignoredPair}`;
  const label = STRENGTH_LABELS[lang][s].toLowerCase();
  const verdict = en ? (s === 'nothing' ? 'nothing' : `${label} hand`) : s === 'nothing' ? 'nada' : `mano ${label}`;
  const reason =
    `${what} ${en ? 'on' : 'en'} ${boardName(boardInfo.coordination, boardInfo.paired, lang)}` +
    `${why ? ` — ${WHY[lang][why]}` : ''} → ${verdict}.`;

  return { strength: s, reason, made, board: boardInfo, treatedAs };
}
