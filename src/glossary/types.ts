// Poker glossary types.
import type { Lang } from '../i18n/lang';

export type Category =
  | 'hands'
  | 'actions'
  | 'table'
  | 'strategy'
  | 'players'
  | 'tournaments'
  | 'rooms'
  | 'stats'
  | 'slang';

export const CATEGORY_LABELS: Record<Lang, Record<Category, string>> = {
  en: {
    hands: 'Hands',
    actions: 'Actions',
    table: 'Table and positions',
    strategy: 'Strategy',
    players: 'Player types',
    tournaments: 'Tournaments',
    rooms: 'Rooms, money and variants',
    stats: 'Stats and software',
    slang: 'Slang',
  },
  es: {
    hands: 'Manos y jugadas',
    actions: 'Acciones',
    table: 'Mesa y posiciones',
    strategy: 'Estrategia',
    players: 'Tipos de jugador',
    tournaments: 'Torneos',
    rooms: 'Sala, dinero y variantes',
    stats: 'Estadísticas y software',
    slang: 'Jerga',
  },
};

export const CATEGORY_COLORS: Record<Category, string> = {
  hands: '#22e4ff',
  actions: '#a855f7',
  table: '#38bdf8',
  strategy: '#a3ff6b',
  players: '#f472b6',
  tournaments: '#fbbf24',
  rooms: '#fb923c',
  stats: '#2dd4bf',
  slang: '#94a3b8',
};

export interface Term {
  category: Category;
  /** English name and definition. */
  en: { term: string; def: string };
  /** Spanish name, other names people search for, and definition. */
  es: { term: string; aka?: string[]; def: string };
}
