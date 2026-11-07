import type { Lang } from '../i18n/lang';
import { type Card, type Suit, rankLabel } from '../logic';

// Baraja de 4 colores: ♠ negro, ♥ rojo, ♦ azul, ♣ verde.
export const SUIT_TEXT: Record<Suit, string> = {
  '♠': 'text-slate-900',
  '♥': 'text-rose-600',
  '♦': 'text-blue-600',
  '♣': 'text-emerald-600',
};

export const SUIT_GLOW: Record<Suit, string> = {
  '♠': 'shadow-[0_0_24px_-4px_rgba(148,163,184,0.55)]',
  '♥': 'shadow-[0_0_24px_-4px_rgba(244,63,94,0.6)]',
  '♦': 'shadow-[0_0_24px_-4px_rgba(59,130,246,0.65)]',
  '♣': 'shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)]',
};

export const SUIT_NAME: Record<Lang, Record<Suit, string>> = {
  es: { '♠': 'picas', '♥': 'corazones', '♦': 'diamantes', '♣': 'tréboles' },
  en: { '♠': 'spades', '♥': 'hearts', '♦': 'diamonds', '♣': 'clubs' },
};

/** Nombre accesible de una carta: "A de picas" / "A of spades". */
export function cardName(c: Card, lang: Lang): string {
  return `${rankLabel(c.rank)} ${lang === 'en' ? 'of' : 'de'} ${SUIT_NAME[lang][c.suit]}`;
}

export const CARD_SIZES = {
  md: {
    box: 'h-[5.75rem] w-16 rounded-xl sm:h-32 sm:w-[5.5rem]',
    corner: 'left-1.5 top-1 sm:left-2 sm:top-1.5',
    rank: 'text-lg sm:text-2xl',
    cornerSuit: 'text-sm sm:text-lg',
    center: 'pt-4 text-4xl sm:text-5xl',
  },
  board: {
    box: 'h-[4.75rem] w-[3.4rem] rounded-lg sm:h-32 sm:w-[5.5rem] sm:rounded-xl',
    corner: 'left-1 top-0.5 sm:left-2 sm:top-1.5',
    rank: 'text-base sm:text-2xl',
    cornerSuit: 'text-xs sm:text-lg',
    center: 'pt-3 text-3xl sm:text-5xl',
  },
  sm: {
    box: 'h-[4.25rem] w-12 rounded-lg sm:h-20 sm:w-14',
    corner: 'left-1 top-0.5',
    rank: 'text-base sm:text-lg',
    cornerSuit: 'text-xs',
    center: 'pt-3 text-2xl sm:text-3xl',
  },
};

export type CardSize = keyof typeof CARD_SIZES;

export const cardKey = (c: Card) => `${c.rank}${c.suit}`;
