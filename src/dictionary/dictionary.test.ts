import { describe, expect, it } from 'vitest';
import { CATEGORY_LABELS, TERMS, letterOf, normalize, searchTerms, termOfTheDay } from './index';

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
      expect(Object.keys(CATEGORY_LABELS), t.term).toContain(t.category);
    }
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
