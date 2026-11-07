import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PlayingCard } from '../../components/PlayingCard';
import { ToolHeader, headerButtonClass } from '../../components/ToolHeader';
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
import { loadBalanced, saveBalanced } from './storage';
import {
  Feedback,
  OptionGroup,
  PrimaryButton,
  ResetScoreButton,
  Scoreboard,
  ShortcutHint,
} from '../../components/Trainer';
import { EMPTY_SCORE, type Score, loadScore, recordResults, saveScore } from '../../lib/score';
import { useLang } from '../../i18n/lang';
import { SCORE_KEYS, TOOLS } from '../registry';

const SCORE_KEY = SCORE_KEYS.leeLaMesa;
const TOOL = TOOLS.find((t) => t.id === 'lee-la-mesa')!;

const T = {
  en: {
    rules: 'Rules',
    hand: 'Hand',
    balancedTag: 'Balanced',
    randomTag: 'Random',
    table: 'Table',
    yourHand: 'Your hand',
    q1: 'Board texture',
    q2: 'Your hand strength',
    coord: 'Texture',
    strength: 'Strength',
    balanced: 'Balanced mode',
  },
  es: {
    rules: 'Reglas',
    hand: 'Mano',
    balancedTag: 'Equilibrado',
    randomTag: 'Aleatorio',
    table: 'Mesa',
    yourHand: 'Tu mano',
    q1: 'Coordinación de la mesa',
    q2: 'Fuerza de tu mano',
    coord: 'Coordinación',
    strength: 'Fuerza',
    balanced: 'Modo equilibrado',
  },
};

export default function LeeLaMesa() {
  const { lang } = useLang();
  const t = T[lang];
  const [balanced, setBalanced] = useState<boolean>(loadBalanced);
  const [deal, setDeal] = useState<Deal>(() => (loadBalanced() ? dealBalanced() : dealRandom()));
  const [handNo, setHandNo] = useState(1);
  const [coordAnswer, setCoordAnswer] = useState<Coordination | null>(null);
  const [strengthAnswer, setStrengthAnswer] = useState<Strength | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState<Score>(() => loadScore(SCORE_KEY));
  const [showRules, setShowRules] = useState(false);

  const result = useMemo(() => evaluateHand(deal.hole, deal.flop, lang), [deal, lang]);
  const correctCoord = result.board.coordination;
  const correctStrength = result.strength;
  const canCheck = coordAnswer !== null && strengthAnswer !== null && !checked;

  // Tras comprobar, desplaza para que se vean la explicación y "Siguiente mano".
  const footerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (checked) footerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [checked]);

  useEffect(() => saveScore(SCORE_KEY, score), [score]);
  useEffect(() => saveBalanced(balanced), [balanced]);

  const check = useCallback(() => {
    if (coordAnswer === null || strengthAnswer === null || checked) return;
    const results = [coordAnswer === correctCoord, strengthAnswer === correctStrength];
    setScore((s) => recordResults(s, results));
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

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-2xl flex-col gap-5 px-4 py-5 sm:py-8">
      <ToolHeader
        title={TOOL.text[lang].name}
        index="01"
        actions={
          <button onClick={() => setShowRules(true)} className={headerButtonClass}>
            {t.rules}
          </button>
        }
      />

      <Scoreboard score={score} />

      <section
        aria-label={t.table}
        className="neon-border relative overflow-hidden rounded-[2.25rem] bg-[radial-gradient(ellipse_at_center,_#0f2a3a_0%,_#0b1530_45%,_#070918_100%)] px-3 py-6 shadow-[0_0_60px_-20px_var(--color-neon-cyan),inset_0_0_60px_rgba(0,0,0,0.6)] sm:py-9"
      >
        {/* anillo holográfico */}
        <div className="pointer-events-none absolute inset-3 animate-glow rounded-[50%] border border-neon-cyan/20 shadow-[inset_0_0_40px_-10px_var(--color-neon-cyan)] sm:inset-5" />
        <div className="pointer-events-none absolute inset-x-10 top-1/2 h-px bg-gradient-to-r from-transparent via-neon-violet/30 to-transparent" />

        <div className="relative flex items-center justify-between px-2 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
          <span>
            {t.hand} #{String(handNo).padStart(3, '0')}
          </span>
          <span className={balanced ? 'text-neon-violet' : ''}>{balanced ? t.balancedTag : t.randomTag}</span>
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
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-neon-violet/80">{t.yourHand}</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <OptionGroup
          index="01"
          title={t.q1}
          options={FLOP_COORDINATIONS}
          labels={COORDINATION_LABELS[lang]}
          value={coordAnswer}
          correct={checked ? correctCoord : null}
          onChange={setCoordAnswer}
          gridClass="grid-cols-2 sm:grid-cols-4"
        />
        <OptionGroup
          index="02"
          title={t.q2}
          options={STRENGTHS}
          labels={STRENGTH_LABELS[lang]}
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
            title={`${t.coord}: ${COORDINATION_LABELS[lang][correctCoord]}`}
            delay={0}
          >
            {result.board.reason}
          </Feedback>
          <Feedback
            ok={strengthAnswer === correctStrength}
            title={`${t.strength}: ${STRENGTH_LABELS[lang][correctStrength]}`}
            delay={90}
          >
            {result.reason}
          </Feedback>
        </section>
      )}

      <div ref={footerRef} className="mt-auto pb-2 pt-1">
        <PrimaryButton checked={checked} disabled={!checked && !canCheck} onClick={checked ? next : check} />

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
            {t.balanced}
          </label>
          <ResetScoreButton onReset={() => setScore(EMPTY_SCORE)} />
        </div>
        <ShortcutHint />
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
