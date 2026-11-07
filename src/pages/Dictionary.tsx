import { type CSSProperties, useEffect, useMemo, useState } from 'react';
import { ToolHeader } from '../components/ToolHeader';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type Category,
  TERMS,
  type Term,
  letterOf,
  searchTerms,
} from '../dictionary';
import { hashParams } from '../router';
import { APP_NAME } from '../tools/registry';


const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[];
const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

function TermCard({ t }: { t: Term }) {
  const color = CATEGORY_COLORS[t.category];
  return (
    <article
      style={{ '--cc': color } as CSSProperties}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur transition hover:border-[var(--cc)]/40 hover:bg-white/[0.05] sm:p-5"
    >
      <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-[var(--cc)] opacity-60 shadow-[0_0_10px_var(--cc)] transition group-hover:opacity-100" />
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <h3 className="text-lg font-bold text-white">{t.term}</h3>
        <span className="mt-1 shrink-0 rounded-full border border-[var(--cc)]/30 bg-[var(--cc)]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--cc)]">
          {CATEGORY_LABELS[t.category]}
        </span>
      </div>
      {t.aka && t.aka.length > 0 && (
        <p className="mt-1 font-mono text-[11px] text-slate-500">
          también: <span className="text-slate-400">{t.aka.join(' · ')}</span>
        </p>
      )}
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{t.def}</p>
    </article>
  );
}

export function Dictionary() {
  const [query, setQuery] = useState(() => hashParams().get('q') ?? '');
  const [category, setCategory] = useState<Category | null>(null);

  // Si se llega con ?l=A, salta a esa letra.
  useEffect(() => {
    const l = hashParams().get('l');
    if (!l) return;
    // Con un pequeño retardo para ganar a la restauración de scroll del navegador.
    const t = setTimeout(() => document.getElementById(`letra-${l}`)?.scrollIntoView(), 80);
    return () => clearTimeout(t);
  }, []);

  const results = useMemo(() => {
    const pool = category ? TERMS.filter((t) => t.category === category) : TERMS;
    return searchTerms(query, pool);
  }, [query, category]);

  const grouped = useMemo(() => {
    const m = new Map<string, Term[]>();
    for (const t of results) {
      const l = letterOf(t);
      m.set(l, [...(m.get(l) ?? []), t]);
    }
    return m;
  }, [results]);

  const searching = query.trim() !== '';

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-4xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-8">
      <ToolHeader title="Diccionario" subtitle={`${APP_NAME} · Herramienta 06 · ${TERMS.length} términos`} />

      <div className="sticky top-0 z-20 -mx-4 flex flex-col gap-3 bg-void/80 px-4 pb-3 pt-2 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <label className="neon-border relative flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 shadow-[0_0_30px_-12px_var(--color-neon-cyan)]">
          <span className="font-mono text-neon-cyan" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca un término: farol, c-bet, outs…"
            aria-label="Buscar en el diccionario"
            className="w-full bg-transparent text-base text-white placeholder:text-slate-500 focus:outline-none"
          />
          <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-slate-500">
            {results.length}
          </span>
        </label>

        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          <button
            onClick={() => setCategory(null)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              category === null
                ? 'border-neon-cyan bg-neon-cyan/15 text-white shadow-[0_0_14px_-4px_var(--color-neon-cyan)]'
                : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'
            }`}
          >
            Todas
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(category === c ? null : c)}
              style={{ '--cc': CATEGORY_COLORS[c] } as CSSProperties}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                category === c
                  ? 'border-[var(--cc)] bg-[var(--cc)]/15 text-white shadow-[0_0_14px_-4px_var(--cc)]'
                  : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        {!searching && (
          <nav
            aria-label="Índice alfabético"
            className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none] sm:flex-wrap"
          >
            {LETTERS.map((l) => {
              const has = grouped.has(l);
              return (
                <button
                  key={l}
                  disabled={!has}
                  onClick={() => document.getElementById(`letra-${l}`)?.scrollIntoView({ behavior: 'smooth' })}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md font-mono text-xs transition enabled:text-slate-300 enabled:hover:bg-neon-cyan/15 enabled:hover:text-white disabled:text-slate-700"
                >
                  {l}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {results.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-slate-400">
          <p className="text-lg text-white">Sin resultados</p>
          <p className="mt-1 text-sm">Prueba con otra palabra o quita el filtro de categoría.</p>
        </div>
      ) : searching ? (
        <section aria-label="Resultados" className="grid gap-2.5">
          {results.map((t) => (
            <TermCard key={t.term} t={t} />
          ))}
        </section>
      ) : (
        <div className="flex flex-col gap-8">
          {[...grouped.entries()].map(([letter, terms]) => (
            <section key={letter} id={`letra-${letter}`} aria-label={`Letra ${letter}`} className="scroll-mt-44 sm:scroll-mt-56">
              <div className="mb-3 flex items-center gap-3">
                <span className="bg-gradient-to-br from-neon-cyan to-neon-violet bg-clip-text font-mono text-3xl font-bold text-transparent">
                  {letter}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-neon-cyan/40 to-transparent" />
                <span className="font-mono text-[11px] text-slate-600">{terms.length}</span>
              </div>
              <div className="grid gap-2.5">
                {terms.map((t) => (
                  <TermCard key={t.term} t={t} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="pb-2 pt-4 text-center font-mono text-[11px] text-slate-600">
        Términos recopilados de los glosarios de Poker Red y ZerosPoker · definiciones propias
      </p>
    </div>
  );
}
