// Poker glossary: terms collected from the Poker Red and ZerosPoker glossaries,
// deduplicated, with original definitions in English and Spanish.
import type { Lang } from '../i18n/lang';
import { TERMS_0_B } from './terms-1';
import { TERMS_C_E } from './terms-2';
import { TERMS_F_O } from './terms-3';
import { TERMS_P_Z } from './terms-4';
import type { Term } from './types';

export * from './types';

/** Lowercase, no accents or punctuation: used for searching and sorting. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ+$ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const TERMS: Term[] = [...TERMS_0_B, ...TERMS_C_E, ...TERMS_F_O, ...TERMS_P_Z];

/** Stable identifier of a term (its English name). */
export function termId(t: Term): string {
  return t.en.term;
}

/** A term in the requested language: name, other names and definition. */
export function localize(t: Term, lang: Lang): { term: string; aka: string[]; def: string } {
  if (lang === 'es') return { term: t.es.term, aka: t.es.aka ?? [], def: t.es.def };
  const main = normalize(t.en.term);
  const aka = [t.es.term, ...(t.es.aka ?? [])].filter((n) => normalize(n) !== main);
  return { term: t.en.term, aka, def: t.en.def };
}

/** Every name of a term, in both languages. */
function allNames(t: Term): string[] {
  return [t.en.term, t.es.term, ...(t.es.aka ?? [])];
}

/** Alphabetical sort key for a language. */
export function sortKey(t: Term, lang: Lang): string {
  return normalize(localize(t, lang).term);
}

/** Terms sorted alphabetically in the requested language (numbers first). */
export function sortedTerms(lang: Lang, terms: Term[] = TERMS): Term[] {
  return [...terms].sort((a, b) => sortKey(a, lang).localeCompare(sortKey(b, lang), lang, { numeric: true }));
}

/** Index letter: A–Z, or "#" when the name starts with a number. */
export function letterOf(t: Term, lang: Lang): string {
  const first = sortKey(t, lang)[0] ?? '#';
  return /[a-z]/.test(first) ? first.toUpperCase() : '#';
}

/**
 * Searches the names (in both languages) and the definition in the requested language. Ranking:
 * exact match, starts with the query, contains it, and finally only in the definition.
 */
export function searchTerms(query: string, terms: Term[], lang: Lang): Term[] {
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

/** Term of the day: changes daily and is the same for everyone. */
export function termOfTheDay(date = new Date()): Term {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return TERMS[(day * 7919) % TERMS.length];
}
