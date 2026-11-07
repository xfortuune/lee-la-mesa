import { describe, expect, it } from 'vitest';
import {
  CATEGORY_LABELS,
  TERMS,
  letterOf,
  localize,
  normalize,
  searchTerms,
  sortedTerms,
  termOfTheDay,
} from './index';

const byEs = (name: string) => TERMS.find((t) => t.es.term === name)!;

describe('glossary', () => {
  it('has 380 terms', () => {
    expect(TERMS.length).toBe(380);
  });

  it('no Spanish name or alias is shared between terms', () => {
    const seen = new Map<string, string>();
    const dups: string[] = [];
    for (const t of TERMS) {
      for (const name of [t.es.term, ...(t.es.aka ?? [])]) {
        const k = normalize(name);
        const prev = seen.get(k);
        if (prev && prev !== t.es.term) dups.push(`"${name}" in ${prev} and ${t.es.term}`);
        seen.set(k, t.es.term);
      }
    }
    expect(dups).toEqual([]);
  });

  it('English names are unique', () => {
    const seen = new Set<string>();
    const dups = TERMS.map((t) => normalize(t.en.term)).filter((k) => (seen.has(k) ? true : (seen.add(k), false)));
    expect(dups).toEqual([]);
  });

  it('every term has both definitions and a valid category', () => {
    for (const t of TERMS) {
      expect(t.en.def.length, t.en.term).toBeGreaterThan(3);
      expect(t.es.def.length, t.es.term).toBeGreaterThan(3);
      expect(Object.keys(CATEGORY_LABELS.en), t.en.term).toContain(t.category);
    }
  });

  it('sorts alphabetically per language, numbers first', () => {
    expect(localize(sortedTerms('es')[0], 'es').term).toBe('3-bet');
    expect(localize(sortedTerms('en')[0], 'en').term).toBe('3-bet');
    expect(letterOf(sortedTerms('en')[0], 'en')).toBe('#');
    expect(letterOf(byEs('Pagar'), 'en')).toBe('C');
    expect(letterOf(byEs('Pagar'), 'es')).toBe('P');
  });

  it('localizes names and aliases', () => {
    const bluff = byEs('Farol');
    expect(localize(bluff, 'en').term).toBe('Bluff');
    expect(localize(bluff, 'en').aka).toContain('Farol');
    expect(localize(bluff, 'es').term).toBe('Farol');
  });

  it('searches names in both languages, without accents', () => {
    expect(searchTerms('farol', TERMS, 'es')[0].es.term).toBe('Farol');
    expect(searchTerms('bluff', TERMS, 'es')[0].es.term).toBe('Farol');
    expect(searchTerms('farol', TERMS, 'en')[0].en.term).toBe('Bluff');
    expect(searchTerms('cbet', TERMS, 'es').map((t) => t.es.term)).toContain('Apuesta de continuación');
    expect(searchTerms('accion', TERMS, 'es').map((t) => t.es.term)).toContain('Acción');
    expect(searchTerms('BB', TERMS, 'en').map((t) => t.en.term)).toContain('Big blind');
  });

  it('also matches definitions, after names', () => {
    const r = searchTerms('escalera', TERMS, 'es');
    expect(r[0].es.term).toMatch(/escalera/i);
    expect(r.length).toBeGreaterThan(5);
  });

  it('term of the day is stable within a day', () => {
    expect(termOfTheDay(new Date(2026, 10, 6))).toBe(termOfTheDay(new Date(2026, 10, 6, 23)));
  });
});
