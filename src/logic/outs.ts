// Outs: cartas que, al salir en la siguiente calle, mejoran tu mano.
import type { Lang } from '../i18n/lang';
import { type Card, cardsToString, fullDeck, joinList, parseCards, shuffle } from './cards';
import { HAND_CATEGORIES, HAND_LABELS, type HandCategory, cardToInt, categoryOf, evaluate } from './equity';

const CAT = Object.fromEntries(HAND_CATEGORIES.map((c, i) => [c, i])) as Record<HandCategory, number>;

/** Motivo por el que una carta es out (de mejor a peor). */
export type OutReason = HandCategory | 'Pareja máxima';

export interface OutGroup {
  reason: OutReason;
  cards: Card[];
}

export type Street = 'flop' | 'turn';

export interface OutsResult {
  street: Street;
  /** Jugada actual con tus cartas. */
  current: HandCategory;
  outs: Card[];
  /** Outs agrupados por la jugada que consiguen (cada carta en un solo grupo). */
  groups: OutGroup[];
  /** Cartas que quedan por salir (47 en el flop, 46 en el turn). */
  unseen: number;
  /** Multiplicador de la regla: 4 en el flop (dos cartas por venir), 2 en el turn. */
  factor: 2 | 4;
  /** Estimación con la regla del 2 y del 4, en %. */
  estimate: number;
  /** Probabilidad exacta de ligar al menos un out hasta el river, en %. */
  exact: number;
  reason: string;
}

const REASON_ORDER: OutReason[] = [
  'Escalera de color',
  'Póker',
  'Full',
  'Color',
  'Escalera',
  'Trío',
  'Dobles parejas',
  'Pareja máxima',
];

const cat = (cards: Card[]) => categoryOf(evaluate(cards.map(cardToInt)));

/** ¿Por qué `card` es out? null si no lo es. */
export function outReason(hole: Card[], board: Card[], card: Card): OutReason | null {
  const now = CAT[cat([...hole, ...board])];
  const next = CAT[cat([...hole, ...board, card])];
  const boardOnly = CAT[cat([...board, card])];
  // Tiene que mejorar tu jugada y superar lo que ya da la mesa sola.
  if (next <= now || next <= boardOnly) return null;

  if (next >= CAT['Escalera']) return HAND_CATEGORIES[next];
  if (next === CAT['Pareja']) {
    // Solo cuenta emparejar una overcard (carta tuya más alta que toda la mesa).
    const topBoard = Math.max(...board.map((c) => c.rank));
    const paired = hole.find((h) => h.rank === card.rank);
    return paired && paired.rank > topBoard ? 'Pareja máxima' : null;
  }
  // Dobles parejas o trío: la carta tiene que emparejar una de las tuyas
  // (si solo empareja la mesa, mejora a todos por igual).
  return hole.some((h) => h.rank === card.rank) ? HAND_CATEGORIES[next] : null;
}

function binom2(n: number): number {
  return (n * (n - 1)) / 2;
}

function describeGroup(g: OutGroup, lang: Lang): string {
  const n = g.cards.length;
  return `${HAND_LABELS[lang][g.reason].toLowerCase()} (${n} out${n === 1 ? '' : 's'}: ${cardsToString(g.cards)})`;
}

/** Cuenta los outs. `lang` solo afecta al texto de la explicación. */
export function computeOuts(hole: Card[], board: Card[], lang: Lang = 'es'): OutsResult {
  if (hole.length !== 2) throw new Error('Se necesitan 2 cartas en mano.');
  if (board.length !== 3 && board.length !== 4) throw new Error('La mesa debe tener 3 (flop) o 4 (turn) cartas.');

  const street: Street = board.length === 3 ? 'flop' : 'turn';
  const known = new Set([...hole, ...board].map(cardToInt));
  const unseenCards = fullDeck().filter((c) => !known.has(cardToInt(c)));
  const byReason = new Map<OutReason, Card[]>();
  for (const c of unseenCards) {
    const r = outReason(hole, board, c);
    if (r) byReason.set(r, [...(byReason.get(r) ?? []), c]);
  }
  const groups = REASON_ORDER.filter((r) => byReason.has(r)).map((reason) => ({
    reason,
    cards: byReason.get(reason)!.sort((a, b) => b.rank - a.rank),
  }));
  const outs = groups.flatMap((g) => g.cards);
  const n = outs.length;
  const unseen = unseenCards.length;
  const factor = street === 'flop' ? 4 : 2;
  const exact = street === 'flop' ? (1 - binom2(unseen - n) / binom2(unseen)) * 100 : (n / unseen) * 100;
  const current = cat([...hole, ...board]);

  const now = HAND_LABELS[lang][current].toLowerCase();
  const list = joinList(groups.map((g) => describeGroup(g, lang)), lang);
  const reason =
    lang === 'en'
      ? n === 0
        ? `You currently have ${now} and no card improves you.`
        : `You currently have ${now}. ${n} cards improve you: ${list}.`
      : n === 0
        ? `Ahora tienes ${now} y ninguna carta te hace mejorar.`
        : `Ahora tienes ${now}. Te mejoran ${n} cartas: ${list}.`;

  return { street, current, outs, groups, unseen, factor, estimate: n * factor, exact, reason };
}

/** Texto de la regla: "9 outs × 4 = 36 %". */
export function ruleText(r: OutsResult, lang: Lang = 'es'): string {
  return lang === 'en'
    ? `Rule of ${r.factor}: ${r.outs.length} outs × ${r.factor} = ${r.estimate}%`
    : `Regla del ${r.factor}: ${r.outs.length} outs × ${r.factor} = ${r.estimate} %`;
}

/** Opciones de porcentaje para la pregunta (la correcta + 3 distractores), ordenadas. */
export function percentOptions(r: OutsResult, random: () => number = Math.random): number[] {
  const n = r.outs.length;
  const other = r.factor === 4 ? 2 : 4;
  const candidates = [n * other, (n + 2) * r.factor, (n - 2) * r.factor, (n + 1) * r.factor, (n - 1) * r.factor, (n + 3) * r.factor]
    .filter((v) => v > 0 && v !== r.estimate && v <= 100);
  const unique = [...new Set(candidates)];
  const picked = shuffle(unique, random).slice(0, 3);
  return [r.estimate, ...picked].sort((a, b) => a - b);
}

export interface OutsDeal {
  hole: Card[];
  board: Card[];
}

function isPaired(cards: Card[]): boolean {
  return new Set(cards.map((c) => c.rank)).size < cards.length;
}

/**
 * Reparte una situación de entrenamiento: flop o turn (al 50 %), mesa sin emparejar,
 * sin escalera o mejor ya hecha y con al menos un out. El 70 % de las veces con proyecto
 * (color o escalera).
 */
export function dealOuts(random: () => number = Math.random): OutsDeal {
  const street: Street = random() < 0.5 ? 'flop' : 'turn';
  const wantDraw = random() < 0.7;
  for (let i = 0; i < 5000; i++) {
    const deck = shuffle(fullDeck(), random);
    const hole = deck.slice(0, 2);
    const board = deck.slice(2, street === 'flop' ? 5 : 6);
    if (isPaired(board)) continue;
    if (CAT[cat([...hole, ...board])] >= CAT['Escalera']) continue;
    const r = computeOuts(hole, board);
    if (r.outs.length < 2) continue;
    const hasDraw = r.groups.some((g) => CAT[g.reason as HandCategory] >= CAT['Escalera']);
    if (hasDraw !== wantDraw) continue;
    return { hole, board };
  }
  return { hole: parseCards('A♥K♥'), board: parseCards('Q♥7♥2♣') };
}

