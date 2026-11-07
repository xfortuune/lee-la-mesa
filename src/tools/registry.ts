// Registro de herramientas del hub. Para añadir una nueva: crea su carpeta en
// src/tools/, añade aquí su entrada y su componente en src/App.tsx.
import type { Lang } from '../i18n/lang';

export const APP_NAME = 'PokerToolBox';

/** Dominio previsto del proyecto. */
export const APP_DOMAIN = 'pokertoolbox.com';

/** Claves de localStorage del marcador de cada entrenador. */
export const SCORE_KEYS = {
  leeLaMesa: 'lee-la-mesa:marcador',
  outs: 'outs:marcador',
};

export interface Tool {
  id: string;
  /** Número que se muestra en la tarjeta (01, 02…). */
  index: string;
  /** Textos de la tarjeta en cada idioma. */
  text: Record<Lang, { name: string; tagline: string; description: string }>;
  /** Símbolo grande de la tarjeta. */
  glyph: string;
  /** Color de acento (variable CSS). */
  accent: string;
  ready: boolean;
  /** Si es un entrenador con marcador, su clave de localStorage. */
  scoreKey?: string;
}

export const TOOLS: Tool[] = [
  {
    id: 'lee-la-mesa',
    index: '01',
    text: {
      en: { name: "Read the Board", tagline: "Texture and hand strength", description: "Classify the flop and rate your hand strength with the EducaPoker method." },
      es: { name: "Lee la mesa", tagline: "Coordinación y fuerza", description: "Clasifica el flop y valora la fuerza de tu mano con el método EducaPoker." },
    },
    glyph: '♠',
    accent: 'var(--color-neon-cyan)',
    ready: true,
    scoreKey: SCORE_KEYS.leeLaMesa,
  },
  {
    id: 'calculadora',
    index: '02',
    text: {
      en: { name: "Calculator", tagline: "Equity and odds", description: "Pick cards for up to 10 players and the board, and instantly see who wins and how often." },
      es: { name: "Calculadora", tagline: "Equity y probabilidades", description: "Elige cartas para hasta 10 jugadores y la mesa, y calcula al instante quién gana y con qué probabilidad." },
    },
    glyph: '♦',
    accent: 'var(--color-neon-violet)',
    ready: true,
  },
  {
    id: 'outs',
    index: '03',
    text: {
      en: { name: "Outs", tagline: "Draws and odds", description: "Count the cards that improve you and estimate your odds of hitting with the rule of 2 and 4." },
      es: { name: "Outs", tagline: "Proyectos y probabilidades", description: "Cuenta las cartas que te mejoran y estima tu probabilidad de ligar con la regla del 2 y del 4." },
    },
    glyph: '♣',
    accent: 'var(--color-neon-pink)',
    ready: true,
    scoreKey: SCORE_KEYS.outs,
  },
  {
    id: 'herramienta-4',
    index: '04',
    text: {
      en: { name: "Tool 4", tagline: "Under construction", description: "A new training tool is coming soon." },
      es: { name: "Herramienta 4", tagline: "En construcción", description: "Una nueva herramienta de entrenamiento llegará pronto." },
    },
    glyph: '♥',
    accent: 'var(--color-neon-lime)',
    ready: false,
  },
  {
    id: 'herramienta-5',
    index: '05',
    text: {
      en: { name: "Tool 5", tagline: "Under construction", description: "A new training tool is coming soon." },
      es: { name: "Herramienta 5", tagline: "En construcción", description: "Una nueva herramienta de entrenamiento llegará pronto." },
    },
    glyph: '✦',
    accent: '#fbbf24',
    ready: false,
  },
  {
    id: 'diccionario',
    index: '06',
    text: {
      en: { name: "Glossary", tagline: "Poker slang", description: "Over 350 terms, from 3-bet to WSOP, explained in a few words and searchable." },
      es: { name: "Diccionario", tagline: "Jerga del póker", description: "Más de 350 términos, del 3-bet al WSOP, explicados en pocas palabras y con buscador." },
    },
    glyph: 'Aa',
    accent: '#38bdf8',
    ready: true,
  },
];

export function toolHref(tool: Tool): string {
  return `#/${tool.id}`;
}
