import { describe, expect, it } from 'vitest';
import { CATEGORY_LABELS, TERMS, letterOf, localize, normalize, searchTerms, sortedTerms, termOfTheDay } from './index';
import { TERMS_EN } from './terms-en';

describe('diccionario', () => {
  it('tiene más de 300 términos', () => {
    expect(TERMS.length).toBeGreaterThan(300);
  });

  it('no hay duplicados entre nombres y alias', () => {
    const seen = new Map<string, string>();
    const dups: string[] = [];
    for (const t of TERMS) {
      for (const name of [t.term, ...(t.aka ?? [])]) {
        const k = normalize(name);
        const prev = seen.get(k);
        if (prev && prev !== t.term) dups.push(`"${name}" en ${prev} y ${t.term}`);
        seen.set(k, t.term);
      }
    }
    expect(dups).toEqual([]);
  });

  it('cada término tiene definición y categoría válida', () => {
    for (const t of TERMS) {
      expect(t.def.length, t.term).toBeGreaterThan(10);
      expect(Object.keys(CATEGORY_LABELS.es), t.term).toContain(t.category);
    }
  });

  it('todos los términos tienen versión en inglés, y nada sobra', () => {
    const missing = TERMS.filter((t) => !TERMS_EN[t.term]).map((t) => t.term);
    expect(missing).toEqual([]);
    const known = new Set(TERMS.map((t) => t.term));
    expect(Object.keys(TERMS_EN).filter((k) => !known.has(k))).toEqual([]);
  });

  it('los nombres en inglés no se repiten', () => {
    const seen = new Map<string, string>();
    const dups: string[] = [];
    for (const t of TERMS) {
      const k = normalize(TERMS_EN[t.term].term);
      if (seen.has(k)) dups.push(`${TERMS_EN[t.term].term} (${seen.get(k)} / ${t.term})`);
      seen.set(k, t.term);
    }
    expect(dups).toEqual([]);
  });

  it('en inglés: localiza, busca y ordena', () => {
    const farol = TERMS.find((t) => t.term === 'Farol')!;
    expect(localize(farol, 'en').term).toBe('Bluff');
    expect(localize(farol, 'en').aka).toContain('Farol');
    expect(searchTerms('bluff', TERMS, 'en')[0].term).toBe('Farol');
    expect(searchTerms('farol', TERMS, 'en')[0].term).toBe('Farol');
    const en = sortedTerms('en');
    expect(localize(en[0], 'en').term).toBe('3-bet');
    expect(letterOf(en.find((t) => t.term === 'Pagar')!, 'en')).toBe('C');
  });

  it('está ordenado alfabéticamente con los números primero', () => {
    expect(letterOf(TERMS[0])).toBe('#');
    expect(TERMS[0].term).toBe('3-bet');
  });

  it('busca por nombre, alias y sin tildes', () => {
    expect(searchTerms('farol')[0].term).toBe('Farol');
    expect(searchTerms('bluff')[0].term).toBe('Farol');
    expect(searchTerms('cbet').map((t) => t.term)).toContain('Apuesta de continuación');
    expect(searchTerms('accion').map((t) => t.term)).toContain('Acción');
    expect(searchTerms('BB').map((t) => t.term)).toContain('Ciega grande');
  });

  it('también encuentra por la definición, después de los nombres', () => {
    const r = searchTerms('escalera');
    expect(r[0].term).toMatch(/escalera/i);
    expect(r.length).toBeGreaterThan(5);
  });

  it('término del día estable para una fecha', () => {
    const d = new Date(2026, 10, 6);
    expect(termOfTheDay(d)).toBe(termOfTheDay(new Date(2026, 10, 6, 23)));
  });
});
