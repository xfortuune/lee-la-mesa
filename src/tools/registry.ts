// Registro de herramientas del hub. Para añadir una nueva: crea su carpeta en
// src/tools/, añade aquí su entrada y su componente en src/App.tsx.

export const APP_NAME = "Hold'em Lab";

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
    id: 'herramienta-3',
    index: '03',
    name: 'Herramienta 3',
    tagline: 'En construcción',
    description: 'Una nueva herramienta de entrenamiento llegará pronto.',
    glyph: '♣',
    accent: 'var(--color-neon-pink)',
    ready: false,
  },
];

export function toolHref(tool: Tool): string {
  return `#/${tool.id}`;
}
