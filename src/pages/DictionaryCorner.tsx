import { type CSSProperties, useState } from 'react';
import { CATEGORY_COLORS, CATEGORY_LABELS, TERMS, letterOf, termOfTheDay } from '../dictionary';
import { routeHref } from '../router';

const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
const PRESENT = new Set(TERMS.map(letterOf));

/** Rincón del diccionario en el hub: buscador, índice A–Z y término del día. */
export function DictionaryCorner() {
  const [query, setQuery] = useState('');
  const today = termOfTheDay();
  const color = CATEGORY_COLORS[today.category];

  return (
    <section
      aria-label="Diccionario de póker"
      className="neon-border relative mt-5 grid animate-rise gap-6 overflow-hidden rounded-3xl bg-white/[0.03] p-5 backdrop-blur-md [animation-delay:400ms] sm:p-7 md:grid-cols-[1.2fr_1fr] md:gap-8"
    >
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-neon-cyan opacity-10 blur-3xl" />

      <div className="relative flex flex-col">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon-cyan/80">// Rincón del diccionario</p>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Diccionario de póker</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          {TERMS.length} términos de la jerga del póker, del <span className="text-slate-200">3-bet</span> al{' '}
          <span className="text-slate-200">WSOP</span>, explicados en pocas palabras.
        </p>

        <form
          className="mt-5 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.hash = routeHref('diccionario', query.trim() ? { q: query.trim() } : undefined);
          }}
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué es un squeeze?"
            aria-label="Buscar en el diccionario"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-neon-cyan/60 focus:shadow-[0_0_20px_-6px_var(--color-neon-cyan)] focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet px-4 text-sm font-bold uppercase tracking-[0.15em] text-void shadow-[0_0_24px_-8px_var(--color-neon-cyan)] transition hover:shadow-[0_0_30px_-6px_var(--color-neon-violet)]"
          >
            Buscar
          </button>
        </form>

        <nav aria-label="Índice alfabético" className="mt-4 flex flex-wrap gap-1">
          {LETTERS.filter((l) => PRESENT.has(l)).map((l) => (
            <a
              key={l}
              href={routeHref('diccionario', { l })}
              className="grid h-7 w-7 place-items-center rounded-md border border-white/5 font-mono text-xs text-slate-400 transition hover:border-neon-cyan/50 hover:bg-neon-cyan/10 hover:text-white"
            >
              {l}
            </a>
          ))}
        </nav>
      </div>

      <a
        href={routeHref('diccionario', { q: today.term })}
        style={{ '--cc': color } as CSSProperties}
        className="group relative flex flex-col rounded-2xl border border-white/10 bg-void/50 p-5 transition hover:border-[var(--cc)]/50 hover:shadow-[0_0_40px_-16px_var(--cc)]"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">Término del día</span>
          <span className="rounded-full border border-[var(--cc)]/30 bg-[var(--cc)]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--cc)]">
            {CATEGORY_LABELS[today.category]}
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold text-white">{today.term}</p>
        {today.aka && <p className="mt-0.5 font-mono text-[11px] text-slate-500">{today.aka.slice(0, 3).join(' · ')}</p>}
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{today.def}</p>
        <span className="mt-auto pt-4 font-mono text-xs uppercase tracking-[0.18em] text-[var(--cc)]">
          Abrir diccionario <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
        </span>
      </a>
    </section>
  );
}
