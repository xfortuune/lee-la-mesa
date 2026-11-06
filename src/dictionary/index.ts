// Diccionario de póker: términos recopilados de los glosarios de Poker Red y ZerosPoker,
// sin duplicados y con definiciones propias.
import { TERMS_1 } from './terms-1';
import { TERMS_2 } from './terms-2';
import { TERMS_3 } from './terms-3';
import { TERMS_4 } from './terms-4';
import type { Term } from './types';

export * from './types';

/** Minúsculas, sin tildes ni signos: para buscar y ordenar. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ+$ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Letra del índice: A–Z, o "#" si empieza por número. */
export function letterOf(term: Term): string {
  const first = normalize(term.term)[0] ?? '#';
  return /[a-z]/.test(first) ? first.toUpperCase() : '#';
}

export const TERMS: Term[] = [...TERMS_1, ...TERMS_2, ...TERMS_3, ...TERMS_4].sort((a, b) =>
  normalize(a.term).localeCompare(normalize(b.term), 'es', { numeric: true }),
);

/**
 * Busca en nombre, alias y definición. Orden: coincidencia exacta, empieza por la búsqueda,
 * la contiene y, por último, aparece solo en la definición (dentro de cada grupo, alfabético).
 */
export function searchTerms(query: string, terms: Term[] = TERMS): Term[] {
  const q = normalize(query);
  if (!q) return terms;
  const scored: { t: Term; score: number }[] = [];
  for (const t of terms) {
    const names = [t.term, ...(t.aka ?? [])].map(normalize);
    let score = 0;
    if (names.includes(q)) score = 4;
    else if (names.some((n) => n.startsWith(q))) score = 3;
    else if (names.some((n) => n.includes(q))) score = 2;
    else if (normalize(t.def).includes(q)) score = 1;
    if (score) scored.push({ t, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.t);
}

/** Término del día: cambia cada día y es el mismo para todos. */
export function termOfTheDay(date = new Date()): Term {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return TERMS[(day * 7919) % TERMS.length];
}
