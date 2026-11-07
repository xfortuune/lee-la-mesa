import type { CSSProperties, ReactNode } from 'react';
import { LangSwitch } from '../components/LangSwitch';
import { localize, termOfTheDay } from '../glossary';
import { type Lang, useLang } from '../i18n/lang';
import { hitRate, loadScore } from '../lib/score';
import { APP_NAME, TOOLS, type Tool, toolHref } from '../tools/registry';

const T = {
  en: {
    termOfDay: 'Term of the day',
    accuracy: 'accuracy',
    bestStreak: 'best streak',
    available: 'Available',
    soon: 'Coming soon',
    enter: 'Open',
    locked: 'Locked',
    modules: 'modules live',
    eyebrow: '// Poker lab',
    title1: 'Train your',
    title2: 'game reading',
    intro: "Practice tools for Texas Hold'em. Pick a module and start training.",
    tools: 'Tools',
    footer: 'Built for practice',
  },
  es: {
    termOfDay: 'Término del día',
    accuracy: 'acierto',
    bestStreak: 'mejor racha',
    available: 'Disponible',
    soon: 'Próximamente',
    enter: 'Entrar',
    locked: 'Bloqueada',
    modules: 'módulos activos',
    eyebrow: '// Laboratorio de póker',
    title1: 'Entrena tu',
    title2: 'lectura del juego',
    intro: "Herramientas de práctica para Texas Hold'em. Elige un módulo y empieza a entrenar.",
    tools: 'Herramientas',
    footer: 'Hecho para practicar',
  },
};

/** Short progress summary for each tool, if it has one. */
function toolStats(tool: Tool, lang: Lang): ReactNode {
  const t = T[lang];
  if (tool.id === 'glossary') {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-slate-500">
        {t.termOfDay}:{' '}
        <span className="normal-case tracking-normal text-white">{localize(termOfTheDay(), lang).term}</span>
      </p>
    );
  }
  if (!tool.scoreKey) return null;
  const s = loadScore(tool.scoreKey);
  if (s.hits + s.misses === 0) return null;
  const pct = hitRate(s);
  return (
    <div className="flex gap-4 font-mono text-[11px] uppercase tracking-[0.15em] text-slate-500">
      <span>
        <span className="text-white">{pct}%</span> {t.accuracy}
      </span>
      <span>
        <span className="text-white">{s.bestStreak}</span> {t.bestStreak}
      </span>
    </div>
  );
}

function ToolCard({ tool, delay, lang }: { tool: Tool; delay: number; lang: Lang }) {
  const style = { '--accent': tool.accent, animationDelay: `${delay}ms` } as CSSProperties;
  const stats = toolStats(tool, lang);
  const t = T[lang];
  const text = tool.text[lang];

  const inner = (
    <>
      {/* accent glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent)] opacity-10 blur-3xl transition-opacity duration-500 group-hover:opacity-25" />

      <div className="relative flex items-start justify-between">
        <span className="font-mono text-xs tracking-[0.3em] text-slate-500">{tool.index}</span>
        {tool.ready ? (
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
            {t.available}
          </span>
        ) : (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            {t.soon}
          </span>
        )}
      </div>

      <div
        // Multi-letter glyphs ("Aa") are smaller so they fit in the box.
        style={tool.glyph.length > 1 ? { fontSize: '1.6rem', fontWeight: 700 } : undefined}
        className={`relative my-5 grid h-16 w-16 place-items-center rounded-2xl border text-4xl md:my-6 md:h-20 md:w-20 md:text-5xl transition duration-500 ${
          tool.ready
            ? 'border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)] shadow-[0_0_40px_-10px_var(--accent)] group-hover:scale-105 group-hover:shadow-[0_0_50px_-6px_var(--accent)]'
            : 'border-white/10 bg-white/[0.03] text-slate-600'
        }`}
      >
        {tool.glyph}
      </div>

      <div className="relative flex flex-1 flex-col">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--accent)] opacity-80">
          {text.tagline}
        </p>
        <h2 className={`mt-1 text-2xl font-bold ${tool.ready ? 'text-white' : 'text-slate-400'}`}>{text.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{text.description}</p>

        <div className="mt-auto flex flex-col gap-3 pt-6">
          {stats}
          <div
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition ${
              tool.ready
                ? 'border-[var(--accent)]/40 bg-[var(--accent)]/10 text-white group-hover:bg-[var(--accent)] group-hover:text-void'
                : 'border-white/5 bg-white/[0.02] text-slate-600'
            }`}
          >
            {tool.ready ? t.enter : t.locked}
            <span className="transition-transform duration-300 group-hover:translate-x-1">{tool.ready ? '→' : '⏳'}</span>
          </div>
        </div>
      </div>
    </>
  );

  const base =
    'group relative flex animate-rise md:min-h-[22rem] flex-col overflow-hidden rounded-3xl border bg-white/[0.03] p-6 backdrop-blur-md';

  if (!tool.ready) {
    return (
      <div aria-disabled="true" style={style} className={`${base} border-white/5 opacity-70`}>
        {inner}
      </div>
    );
  }
  return (
    <a
      href={toolHref(tool)}
      style={style}
      className={`${base} border-white/10 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/60 hover:shadow-[0_20px_60px_-25px_var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]`}
    >
      {inner}
    </a>
  );
}

export function Home() {
  const { lang } = useLang();
  const t = T[lang];
  const ready = TOOLS.filter((t) => t.ready).length;
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-8">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="neon-border grid h-11 w-11 place-items-center rounded-xl bg-white/[0.04] text-xl text-neon-cyan shadow-[0_0_24px_-6px_var(--color-neon-cyan)]">
            ♠
          </div>
          <span className="text-xl font-bold tracking-tight text-white" aria-label={APP_NAME}>
            Poker
            <span className="bg-gradient-to-r from-neon-cyan to-neon-violet bg-clip-text text-transparent">ToolBox</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400 md:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan shadow-[0_0_8px_var(--color-neon-cyan)]" />
            {ready}/{TOOLS.length} {t.modules}
          </span>
          <LangSwitch />
        </div>
      </header>

      <section className="mx-auto mt-12 max-w-3xl animate-rise text-center sm:mt-20">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-neon-cyan/80">{t.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
          {t.title1}{' '}
          <span className="bg-gradient-to-r from-neon-cyan via-[#7aa2ff] to-neon-violet bg-clip-text text-transparent">
            {t.title2}
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
          {t.intro}
        </p>
      </section>

      <section aria-label={t.tools} className="mt-12 grid gap-4 sm:mt-16 md:grid-cols-3 md:gap-5">
        {TOOLS.map((tool, i) => (
          <ToolCard key={tool.id} tool={tool} delay={120 + i * 90} lang={lang} />
        ))}
      </section>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-14 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">
        <span>{APP_NAME} · v1</span>
        <span>{t.footer} ♠ ♥ ♦ ♣</span>
      </footer>
    </div>
  );
}
