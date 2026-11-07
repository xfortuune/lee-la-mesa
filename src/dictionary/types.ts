// Tipos del diccionario de póker.
import type { Lang } from '../i18n/lang';

export type Category =
  | 'jugadas'
  | 'acciones'
  | 'mesa'
  | 'estrategia'
  | 'jugadores'
  | 'torneos'
  | 'sala'
  | 'stats'
  | 'jerga';

export const CATEGORY_LABELS: Record<Lang, Record<Category, string>> = {
  es: {
    jugadas: 'Manos y jugadas',
    acciones: 'Acciones',
    mesa: 'Mesa y posiciones',
    estrategia: 'Estrategia',
    jugadores: 'Tipos de jugador',
    torneos: 'Torneos',
    sala: 'Sala, dinero y variantes',
    stats: 'Estadísticas y software',
    jerga: 'Jerga',
  },
  en: {
    jugadas: 'Hands',
    acciones: 'Actions',
    mesa: 'Table and positions',
    estrategia: 'Strategy',
    jugadores: 'Player types',
    torneos: 'Tournaments',
    sala: 'Rooms, money and variants',
    stats: 'Stats and software',
    jerga: 'Slang',
  },
};

export const CATEGORY_COLORS: Record<Category, string> = {
  jugadas: '#22e4ff',
  acciones: '#a855f7',
  mesa: '#38bdf8',
  estrategia: '#a3ff6b',
  jugadores: '#f472b6',
  torneos: '#fbbf24',
  sala: '#fb923c',
  stats: '#2dd4bf',
  jerga: '#94a3b8',
};

export interface Term {
  /** Nombre principal. */
  term: string;
  /** Otros nombres o traducciones con los que se busca. */
  aka?: string[];
  category: Category;
  /** Definición (redactada para este proyecto). */
  def: string;
}
