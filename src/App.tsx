import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PlayingCard } from './components/PlayingCard';
import { RulesModal } from './components/RulesModal';
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
} from './logic';
import { EMPTY_SCORE, type Score, loadBalanced, loadScore, saveBalanced, saveScore } from './storage';

interface OptionGroupProps<T extends string> {
  title: string;
  options: T[];
  labels: Record<T, string>;
  value: T | null;
  correct: T | null; // solo tras comprobar
  onChange: (v: T) => void;
}

function OptionGroup<T extends string>({ title, options, labels, value, correct, onChange }: OptionGroupProps<T>) {
  const checked = correct !== null;
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold uppercase tracking-wide text-green-200">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt;
          let style = 'border-white/20 bg-white/10 text-white hover:bg-white/20';
          if (selected && !checked) style = 'border-amber-300 bg-amber-400 text-gray-900';
          if (checked) {
            if (opt === correct) style = 'border-green-300 bg-green-500 text-white';
            else if (selected) style = 'border-red-300 bg-red-500 text-white';
            else style = 'border-white/10 bg-white/5 text-white/50';
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={checked}
              aria-pressed={selected}
              onClick={() => onChange(opt)}
              className={`min-h-11 grow rounded-xl border px-3 py-2 text-sm font-medium transition sm:grow-0 sm:text-base ${style}`}
            >
              {labels[opt]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Feedback({ ok, title, text }: { ok: boolean; title: string; text: string }) {
  return (
    <div
      className={`rounded-xl border p-3 text-sm leading-relaxed ${
        ok ? 'border-green-400/50 bg-green-500/15 text-green-50' : 'border-red-400/50 bg-red-500/15 text-red-50'
      }`}
    >
      <p className="mb-1 font-semibold">
        {ok ? '✓' : '✗'} {title}
      </p>
      <p>{text}</p>
    </div>
  );
}

export default function App() {
  const [balanced, setBalanced] = useState<boolean>(loadBalanced);
  const [deal, setDeal] = useState<Deal>(() => (loadBalanced() ? dealBalanced() : dealRandom()));
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
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-4 px-4 py-4 text-white sm:py-6">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Lee la mesa <span className="text-green-400">♠</span>
        </h1>
        <button
          onClick={() => setShowRules(true)}
          className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/20"
        >
          Reglas
        </button>
      </header>

      <section aria-label="Marcador" className="grid grid-cols-4 gap-2 text-center">
        {[
          ['Aciertos', score.hits, 'text-green-300'],
          ['Fallos', score.misses, 'text-red-300'],
          ['% acierto', `${pct}%`, 'text-white'],
          ['Racha', score.streak, 'text-amber-300'],
        ].map(([label, value, color]) => (
          <div key={label as string} className="rounded-xl bg-white/5 px-1 py-2">
            <div className={`text-xl font-bold sm:text-2xl ${color}`}>{value}</div>
            <div className="text-[11px] uppercase tracking-wide text-white/60 sm:text-xs">{label}</div>
          </div>
        ))}
      </section>

      <section
        aria-label="Mesa"
        className="flex flex-col items-center gap-5 rounded-[2.5rem] border-8 border-amber-900 bg-[radial-gradient(ellipse_at_center,_#15803d_0%,_#14532d_75%)] px-3 py-6 shadow-[inset_0_0_40px_rgba(0,0,0,0.45)] sm:gap-7 sm:py-8"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-green-100/70">Flop</span>
          <div className="flex gap-2 sm:gap-3">
            {deal.flop.map((c) => (
              <PlayingCard key={`${c.rank}${c.suit}`} card={c} />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2 sm:gap-3">
            {deal.hole.map((c) => (
              <PlayingCard key={`${c.rank}${c.suit}`} card={c} />
            ))}
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-green-100/70">Tu mano</span>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <OptionGroup
          title="1. Coordinación de la mesa"
          options={FLOP_COORDINATIONS}
          labels={COORDINATION_LABELS}
          value={coordAnswer}
          correct={checked ? correctCoord : null}
          onChange={setCoordAnswer}
        />
        <OptionGroup
          title="2. Fuerza de tu mano"
          options={STRENGTHS}
          labels={STRENGTH_LABELS}
          value={strengthAnswer}
          correct={checked ? correctStrength : null}
          onChange={setStrengthAnswer}
        />
      </section>

      {checked && (
        <section aria-live="polite" className="flex flex-col gap-2">
          <Feedback
            ok={coordAnswer === correctCoord}
            title={`Coordinación: ${COORDINATION_LABELS[correctCoord]}`}
            text={result.board.reason}
          />
          <Feedback
            ok={strengthAnswer === correctStrength}
            title={`Fuerza: ${STRENGTH_LABELS[correctStrength]}`}
            text={result.reason}
          />
        </section>
      )}

      <div ref={footerRef} className="mt-auto pb-2 pt-1">
        {checked ? (
          <button
            onClick={next}
            className="w-full rounded-2xl bg-amber-400 py-3.5 text-lg font-bold text-gray-900 shadow-lg hover:bg-amber-300"
          >
            Siguiente mano
          </button>
        ) : (
          <button
            onClick={check}
            disabled={!canCheck}
            className="w-full rounded-2xl bg-amber-400 py-3.5 text-lg font-bold text-gray-900 shadow-lg hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40"
          >
            Comprobar
          </button>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-white/70">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={balanced}
              onChange={(e) => setBalanced(e.target.checked)}
              className="h-4 w-4 accent-amber-400"
            />
            Modo equilibrado
            <span className="hidden text-white/40 sm:inline">(flops de los 3 tipos por igual)</span>
          </label>
          <button
            onClick={() => {
              if (window.confirm('¿Reiniciar el marcador?')) setScore(EMPTY_SCORE);
            }}
            className="underline-offset-2 hover:underline"
          >
            Reiniciar marcador
          </button>
        </div>
        <p className="mt-1 hidden text-xs text-white/40 sm:block">Atajo: Enter o Espacio para comprobar / siguiente mano.</p>
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
