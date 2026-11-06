import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PlayingCard } from '../../components/PlayingCard';
import { APP_NAME } from '../registry';
import { RulesModal } from './RulesModal';
import {
  COORDINATION_LABELS,
  type Coordination,
  type Deal,
  FLOP_COORDINATIONS,
  STRENGTHS,
  STRENGTH_LABELS,
  type Strength,
  dealBalanced,
  dealRandom,
  evaluateHand,
} from '../../logic';
import { EMPTY_SCORE, type Score, loadBalanced, loadScore, saveBalanced, saveScore } from './storage';

interface OptionGroupProps<T extends string> {
  index: string;
  title: string;
  options: T[];
  labels: Record<T, string>;
  value: T | null;
  correct: T | null; // solo tras comprobar
  onChange: (v: T) => void;
  gridClass: string;
}

function OptionGroup<T extends string>({
  index,
  title,
  options,
  labels,
  value,
  correct,
  onChange,
  gridClass,
}: OptionGroupProps<T>) {
  const checked = correct !== null;
  return (
    <fieldset>
      <legend className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        <span className="font-mono text-neon-cyan">{index}</span>
        {title}
      </legend>
      <div className={`grid gap-2 ${gridClass}`}>
        {options.map((opt) => {
          const selected = value === opt;
          let style =
            'border-white/10 bg-white/[0.04] text-slate-200 hover:border-neon-cyan/40 hover:bg-white/[0.08] hover:text-white';
          if (selected && !checked)
            style =
              'border-neon-cyan bg-neon-cyan/10 text-white shadow-[0_0_20px_-4px_var(--color-neon-cyan),inset_0_0_12px_-4px_var(--color-neon-cyan)]';
          if (checked) {
            if (opt === correct)
              style =
                'border-emerald-400 bg-emerald-400/15 text-emerald-100 shadow-[0_0_22px_-4px_rgba(52,211,153,0.9)]';
            else if (selected)
              style = 'border-rose-500 bg-rose-500/15 text-rose-100 shadow-[0_0_22px_-4px_rgba(244,63,94,0.9)]';
            else style = 'border-white/5 bg-white/[0.02] text-slate-500';
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={checked}
              aria-pressed={selected}
              onClick={() => onChange(opt)}
              className={`min-h-12 rounded-2xl border px-3 py-2 text-sm font-medium leading-tight backdrop-blur transition duration-200 active:scale-[0.97] sm:text-[15px] ${style}`}
            >
              {labels[opt]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Feedback({ ok, title, text, delay }: { ok: boolean; title: string; text: string; delay: number }) {
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className={`relative animate-rise overflow-hidden rounded-2xl border bg-white/[0.04] p-4 pl-5 text-sm leading-relaxed backdrop-blur ${
        ok ? 'border-emerald-400/30' : 'border-rose-500/30'
      }`}
    >
      <span
        className={`absolute inset-y-0 left-0 w-1 ${
          ok ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)]' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,1)]'
        }`}
      />
      <p className={`mb-1 flex items-center gap-2 font-semibold ${ok ? 'text-emerald-300' : 'text-rose-300'}`}>
        <span className="font-mono text-xs">{ok ? '[ OK ]' : '[ FALLO ]'}</span>
        {title}
      </p>
      <p className="text-slate-300">{text}</p>
    </div>
  );
}

function Stat({ label, value, accent, bar }: { label: string; value: string | number; accent: string; bar?: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-2.5 text-center backdrop-blur">
      <div className={`font-mono text-xl font-bold tabular-nums sm:text-2xl ${accent}`}>{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500 sm:text-[11px]">{label}</div>
      {bar !== undefined && (
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-violet transition-[width] duration-500"
            style={{ width: `${bar}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function LeeLaMesa() {
  const [balanced, setBalanced] = useState<boolean>(loadBalanced);
  const [deal, setDeal] = useState<Deal>(() => (loadBalanced() ? dealBalanced() : dealRandom()));
  const [handNo, setHandNo] = useState(1);
  const [coordAnswer, setCoordAnswer] = useState<Coordination | null>(null);
  const [strengthAnswer, setStrengthAnswer] = useState<Strength | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState<Score>(loadScore);
  const [showRules, setShowRules] = useState(false);

  const result = useMemo(() => evaluateHand(deal.hole, deal.flop), [deal]);
  const correctCoord = result.board.coordination;
  const correctStrength = result.strength;
  const canCheck = coordAnswer !== null && strengthAnswer !== null && !checked;

  // Tras comprobar, desplaza para que se vean la explicación y "Siguiente mano".
  const footerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (checked) footerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [checked]);

  useEffect(() => saveScore(score), [score]);
  useEffect(() => saveBalanced(balanced), [balanced]);

  const check = useCallback(() => {
    if (coordAnswer === null || strengthAnswer === null || checked) return;
    const results = [coordAnswer === correctCoord, strengthAnswer === correctStrength];
    setScore((s) => {
      let { hits, misses, streak, bestStreak } = s;
      for (const ok of results) {
        if (ok) {
          hits++;
          streak++;
          bestStreak = Math.max(bestStreak, streak);
        } else {
          misses++;
          streak = 0;
        }
      }
      return { hits, misses, streak, bestStreak };
    });
    setChecked(true);
  }, [coordAnswer, strengthAnswer, checked, correctCoord, correctStrength]);

  const next = useCallback(() => {
    setDeal(balanced ? dealBalanced() : dealRandom());
    setHandNo((n) => n + 1);
    setCoordAnswer(null);
    setStrengthAnswer(null);
    setChecked(false);
  }, [balanced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showRules) return;
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (checked) next();
      else check();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [checked, check, next, showRules]);

  const total = score.hits + score.misses;
  const pct = total === 0 ? 0 : Math.round((score.hits / total) * 100);

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-2xl flex-col gap-5 px-4 py-5 sm:py-8">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <a
            href="#/"
            aria-label="Volver al inicio"
            title="Volver al inicio"
            className="neon-border grid h-11 w-11 place-items-center rounded-xl bg-white/[0.04] text-xl text-neon-cyan shadow-[0_0_24px_-6px_var(--color-neon-cyan)] transition hover:bg-neon-cyan/10 hover:shadow-[0_0_28px_-4px_var(--color-neon-cyan)]"
          >
            ←
          </a>
          <div>
            <h1 className="bg-gradient-to-r from-white via-neon-cyan to-neon-violet bg-clip-text text-xl font-bold uppercase tracking-[0.12em] text-transparent sm:text-2xl">
              Lee la mesa
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500 sm:text-[11px]">
              {APP_NAME} · Herramienta 01
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowRules(true)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-slate-200 backdrop-blur transition hover:border-neon-violet/60 hover:text-white hover:shadow-[0_0_20px_-6px_var(--color-neon-violet)]"
        >
          Reglas
        </button>
      </header>

      <section aria-label="Marcador" className="grid grid-cols-4 gap-2">
        <Stat label="Aciertos" value={score.hits} accent="text-emerald-300" />
        <Stat label="Fallos" value={score.misses} accent="text-rose-300" />
        <Stat label="Acierto" value={`${pct}%`} accent="text-white" bar={pct} />
        <Stat label="Racha" value={score.streak} accent="text-neon-cyan" />
      </section>

      <section
        aria-label="Mesa"
        className="neon-border relative overflow-hidden rounded-[2.25rem] bg-[radial-gradient(ellipse_at_center,_#0f2a3a_0%,_#0b1530_45%,_#070918_100%)] px-3 py-6 shadow-[0_0_60px_-20px_var(--color-neon-cyan),inset_0_0_60px_rgba(0,0,0,0.6)] sm:py-9"
      >
        {/* anillo holográfico */}
        <div className="pointer-events-none absolute inset-3 animate-glow rounded-[50%] border border-neon-cyan/20 shadow-[inset_0_0_40px_-10px_var(--color-neon-cyan)] sm:inset-5" />
        <div className="pointer-events-none absolute inset-x-10 top-1/2 h-px bg-gradient-to-r from-transparent via-neon-violet/30 to-transparent" />

        <div className="relative flex items-center justify-between px-2 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
          <span>Mano #{String(handNo).padStart(3, '0')}</span>
          <span className={balanced ? 'text-neon-violet' : ''}>{balanced ? 'Equilibrado' : 'Aleatorio'}</span>
        </div>

        <div className="relative mt-3 flex flex-col items-center gap-6 sm:gap-8">
          <div className="flex flex-col items-center gap-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-neon-cyan/70">Flop</span>
            <div className="flex gap-2 sm:gap-3">
              {deal.flop.map((c, i) => (
                <PlayingCard key={`${handNo}-${c.rank}${c.suit}`} card={c} delay={i * 90} />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex gap-2 sm:gap-3">
              {deal.hole.map((c, i) => (
                <PlayingCard key={`${handNo}-${c.rank}${c.suit}`} card={c} delay={320 + i * 90} />
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-neon-violet/80">Tu mano</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <OptionGroup
          index="01"
          title="Coordinación de la mesa"
          options={FLOP_COORDINATIONS}
          labels={COORDINATION_LABELS}
          value={coordAnswer}
          correct={checked ? correctCoord : null}
          onChange={setCoordAnswer}
          gridClass="grid-cols-2 sm:grid-cols-4"
        />
        <OptionGroup
          index="02"
          title="Fuerza de tu mano"
          options={STRENGTHS}
          labels={STRENGTH_LABELS}
          value={strengthAnswer}
          correct={checked ? correctStrength : null}
          onChange={setStrengthAnswer}
          // Móvil: 3 arriba y 2 abajo; escritorio: los 5 en una fila.
          gridClass="grid-cols-6 sm:grid-cols-5 [&>*]:col-span-2 [&>*:nth-child(n+4)]:col-span-3 sm:[&>*]:col-span-1 sm:[&>*:nth-child(n+4)]:col-span-1"
        />
      </section>

      {checked && (
        <section aria-live="polite" className="flex flex-col gap-2.5">
          <Feedback
            ok={coordAnswer === correctCoord}
            title={`Coordinación: ${COORDINATION_LABELS[correctCoord]}`}
            text={result.board.reason}
            delay={0}
          />
          <Feedback
            ok={strengthAnswer === correctStrength}
            title={`Fuerza: ${STRENGTH_LABELS[correctStrength]}`}
            text={result.reason}
            delay={90}
          />
        </section>
      )}

      <div ref={footerRef} className="mt-auto pb-2 pt-1">
        <button
          onClick={checked ? next : check}
          disabled={!checked && !canCheck}
          className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-neon-cyan via-[#6aa8ff] to-neon-violet py-4 text-base font-bold uppercase tracking-[0.2em] text-void shadow-[0_0_40px_-8px_var(--color-neon-cyan)] transition hover:shadow-[0_0_50px_-6px_var(--color-neon-violet)] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-none disabled:bg-white/[0.05] disabled:text-slate-500 disabled:shadow-none"
        >
          <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/40 opacity-0 blur-md transition-all duration-700 group-enabled:group-hover:left-full group-enabled:group-hover:opacity-100" />
          <span className="relative">{checked ? 'Siguiente mano →' : 'Comprobar'}</span>
        </button>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <label className="flex cursor-pointer select-none items-center gap-2.5">
            <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
              <input
                type="checkbox"
                checked={balanced}
                onChange={(e) => setBalanced(e.target.checked)}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-full border border-white/15 bg-white/[0.06] transition peer-checked:border-neon-violet peer-checked:bg-neon-violet/30 peer-checked:shadow-[0_0_14px_-2px_var(--color-neon-violet)] peer-focus-visible:ring-2 peer-focus-visible:ring-neon-cyan" />
              <span className="absolute left-1 h-4 w-4 rounded-full bg-slate-400 transition peer-checked:translate-x-5 peer-checked:bg-white" />
            </span>
            Modo equilibrado
          </label>
          <button
            onClick={() => {
              if (window.confirm('¿Reiniciar el marcador?')) setScore(EMPTY_SCORE);
            }}
            className="font-mono text-xs uppercase tracking-[0.15em] text-slate-500 transition hover:text-rose-300"
          >
            Reiniciar marcador
          </button>
        </div>
        <p className="mt-2 hidden font-mono text-[11px] text-slate-600 sm:block">
          ⏎ Enter / Espacio — comprobar · siguiente mano
        </p>
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
