// Diccionario de póker: términos recopilados de los glosarios de Poker Red y ZerosPoker,
// sin duplicados y con definiciones propias.
import type { Lang } from '../i18n/lang';
import { TERMS_1 } from './terms-1';
import { TERMS_2 } from './terms-2';
import { TERMS_3 } from './terms-3';
import { TERMS_4 } from './terms-4';
import { TERMS_EN } from './terms-en';
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
export function letterOf(term: Term, lang: Lang = 'es'): string {
  const first = sortKey(term, lang)[0] ?? '#';
  return /[a-z]/.test(first) ? first.toUpperCase() : '#';
}

export const TERMS: Term[] = [...TERMS_1, ...TERMS_2, ...TERMS_3, ...TERMS_4].sort((a, b) =>
  normalize(a.term).localeCompare(normalize(b.term), 'es', { numeric: true }),
);

/** Término en el idioma pedido: nombre, otros nombres y definición. */
export function localize(t: Term, lang: Lang): { term: string; aka: string[]; def: string } {
  if (lang === 'es') return { term: t.term, aka: t.aka ?? [], def: t.def };
  const en = TERMS_EN[t.term];
  if (!en) return { term: t.term, aka: t.aka ?? [], def: t.def };
  const main = normalize(en.term);
  const aka = [t.term, ...(t.aka ?? [])].filter((n) => normalize(n) !== main);
  return { term: en.term, aka, def: en.def };
}

/** Todos los nombres de un término, en los dos idiomas. */
function allNames(t: Term): string[] {
  const en = TERMS_EN[t.term];
  return [t.term, ...(t.aka ?? []), ...(en ? [en.term] : [])];
}

/** Clave de orden alfabético según el idioma. */
export function sortKey(t: Term, lang: Lang): string {
  return normalize(localize(t, lang).term);
}

/** Términos ordenados alfabéticamente en el idioma pedido. */
export function sortedTerms(lang: Lang, terms: Term[] = TERMS): Term[] {
  return [...terms].sort((a, b) => sortKey(a, lang).localeCompare(sortKey(b, lang), lang, { numeric: true }));
}

/**
 * Busca en los nombres (de los dos idiomas) y en la definición del idioma pedido. Orden:
 * coincidencia exacta, empieza por la búsqueda, la contiene y, por último, solo en la definición.
 */
export function searchTerms(query: string, terms: Term[] = TERMS, lang: Lang = 'es'): Term[] {
  const q = normalize(query);
  if (!q) return terms;
  const scored: { t: Term; score: number }[] = [];
  for (const t of terms) {
    const names = allNames(t).map(normalize);
    let score = 0;
    if (names.includes(q)) score = 4;
    else if (names.some((n) => n.startsWith(q))) score = 3;
    else if (names.some((n) => n.includes(q))) score = 2;
    else if (normalize(localize(t, lang).def).includes(q)) score = 1;
    if (score) scored.push({ t, score });
  }
  return scored.sort((a, b) => b.score - a.score).map((s) => s.t);
}

/** Término del día: cambia cada día y es el mismo para todos. */
export function termOfTheDay(date = new Date()): Term {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return TERMS[(day * 7919) % TERMS.length];
}
