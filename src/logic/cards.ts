// Representación básica de cartas y baraja.
import type { Lang } from '../i18n/lang';

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = number; // 2..14 (A = 14)

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
export const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

const RANK_CHARS: Record<number, string> = {
  10: 'T',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
};

/** Rango como carácter corto: 2..9, T, J, Q, K, A. */
export function rankChar(rank: Rank): string {
  return RANK_CHARS[rank] ?? String(rank);
}

/** Rango para mostrar en la carta (10 en lugar de T). */
export function rankLabel(rank: Rank): string {
  return rank === 10 ? '10' : rankChar(rank);
}

export function cardToString(card: Card): string {
  return `${rankChar(card.rank)}${card.suit}`;
}

export function cardsToString(cards: Card[]): string {
  return cards.map(cardToString).join(' ');
}

/** Parsea "J♠", "T♥", "10♦" o "Ac" (s/h/d/c también valen). */
export function parseCard(text: string): Card {
  const t = text.trim();
  const suitChar = t.slice(-1);
  const rankText = t.slice(0, -1).toUpperCase();
  const suitMap: Record<string, Suit> = {
    '♠': '♠', s: '♠', S: '♠',
    '♥': '♥', h: '♥', H: '♥',
    '♦': '♦', d: '♦', D: '♦',
    '♣': '♣', c: '♣', C: '♣',
  };
  const suit = suitMap[suitChar];
  const rankMap: Record<string, number> = { T: 10, '10': 10, J: 11, Q: 12, K: 13, A: 14 };
  const rank = rankMap[rankText] ?? Number(rankText);
  if (!suit || !(rank >= 2 && rank <= 14)) {
    throw new Error(`Carta no válida: ${text}`);
  }
  return { rank, suit };
}

/** Parsea varias cartas: "J♠8♥7♦" o "J♠ 8♥ 7♦". */
export function parseCards(text: string): Card[] {
  const matches = text.match(/(10|[2-9TJQKA])[♠♥♦♣shdc]/gi);
  if (!matches) throw new Error(`Cartas no válidas: ${text}`);
  return matches.map(parseCard);
}

export function fullDeck(): Card[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })));
}

/** Mezcla Fisher–Yates. `random` inyectable para tests. */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Lista legible: "Q, J y T". */
export function joinEs(items: string[]): string {
  return joinList(items, 'es');
}

/** Lista legible en el idioma pedido: "Q, J y T" / "Q, J and T". */
export function joinList(items: string[], lang: Lang): string {
  if (items.length <= 1) return items.join('');
  const and = lang === 'en' ? 'and' : 'y';
  return `${items.slice(0, -1).join(', ')} ${and} ${items[items.length - 1]}`;
}
