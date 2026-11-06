// Registro de herramientas del hub. Para añadir una nueva: crea su carpeta en
// src/tools/, añade aquí su entrada y su componente en src/App.tsx.

export const APP_NAME = "Hold'em Lab";

/** Claves de localStorage del marcador de cada entrenador. */
export const SCORE_KEYS = {
  leeLaMesa: 'lee-la-mesa:marcador',
  outs: 'outs:marcador',
};

export interface Tool {
  id: string;
  /** Número que se muestra en la tarjeta (01, 02…). */
  index: string;
  name: string;
  tagline: string;
  description: string;
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
    name: 'Lee la mesa',
    tagline: 'Coordinación y fuerza',
    description: 'Clasifica el flop y valora la fuerza de tu mano con el método EducaPoker.',
    glyph: '♠',
    accent: 'var(--color-neon-cyan)',
    ready: true,
    scoreKey: SCORE_KEYS.leeLaMesa,
  },
  {
    id: 'calculadora',
    index: '02',
    name: 'Calculadora',
    tagline: 'Equity y probabilidades',
    description: 'Elige cartas para hasta 10 jugadores y la mesa, y calcula al instante quién gana y con qué probabilidad.',
    glyph: '♦',
    accent: 'var(--color-neon-violet)',
    ready: true,
  },
  {
    id: 'outs',
    index: '03',
    name: 'Outs',
    tagline: 'Proyectos y probabilidades',
    description: 'Cuenta las cartas que te mejoran y estima tu probabilidad de ligar con la regla del 2 y del 4.',
    glyph: '♣',
    accent: 'var(--color-neon-pink)',
    ready: true,
    scoreKey: SCORE_KEYS.outs,
  },
];

export function toolHref(tool: Tool): string {
  return `#/${tool.id}`;
}
