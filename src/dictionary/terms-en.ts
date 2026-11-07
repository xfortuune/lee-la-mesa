// Versión en inglés de cada término, por el nombre en español. Definiciones propias.
import { EN_1 } from './terms-en-1';
import { EN_2 } from './terms-en-2';
import { EN_3 } from './terms-en-3';
import { EN_4 } from './terms-en-4';

export const TERMS_EN: Record<string, { term: string; def: string }> = Object.fromEntries(
  Object.entries({ ...EN_1, ...EN_2, ...EN_3, ...EN_4 }).map(([es, [term, def]]) => [es, { term, def }]),
);
