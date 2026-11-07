import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PlayingCard } from '../../components/PlayingCard';
import { ToolHeader, headerButtonClass } from '../../components/ToolHeader';
import {
  Feedback,
  OptionGroup,
  PrimaryButton,
  ResetScoreButton,
  Scoreboard,
  ShortcutHint,
} from '../../components/Trainer';
import { CardChip } from '../../components/CardChip';
import { cardKey } from '../../components/cardStyles';
import { EMPTY_SCORE, type Score, loadScore, recordResults, saveScore } from '../../lib/score';
import {
  type OutReason,
  type OutsDeal,
  RANKS,
  SUITS,
  computeOuts,
  dealOuts,
  percentOptions,
  HAND_LABELS,
  rankLabel,
  ruleText,
} from '../../logic';
import { type Lang, useLang } from '../../i18n/lang';
import { SCORE_KEYS } from '../registry';
import { OutsRules } from './OutsRules';

const T = {
  en: {
    rules: 'Rules',
    table: 'Table',
    hand: 'Hand',
    flopTag: 'Flop · 2 cards to come',
    turnTag: 'Turn · 1 card to come',
    yourHand: 'Your hand',
    q1: 'How many outs do you have?',
    q2Flop: 'Odds of hitting by the river',
    q2Turn: 'Odds of hitting on the river',
    nowYouHave: 'You currently have',
    improve: (n: number) => `${n} cards improve you:`,
    odds: 'Odds',
    left2: '(2 cards to come).',
    left1: '(1 card to come).',
    exactIs: 'The exact value is',
    exactFlop: (u: number) => `at least one out among the ${u} unseen cards, over two cards`,
    exactTurn: (n: number, u: number) => `${n} of ${u} cards`,
    wrongOuts: (n: number) => `The percentage is graded with the correct outs (${n}), not the ones you counted.`,
    pct: (v: number) => `${v}%`,
    dec: '.',
  },
  es: {
    rules: 'Reglas',
    table: 'Mesa',
    hand: 'Mano',
    flopTag: 'Flop · quedan 2 cartas',
    turnTag: 'Turn · queda 1 carta',
    yourHand: 'Tu mano',
    q1: '¿Cuántos outs tienes?',
    q2Flop: 'Probabilidad de ligar hasta el river',
    q2Turn: 'Probabilidad de ligar en el river',
    nowYouHave: 'Ahora tienes',
    improve: (n: number) => `Te mejoran ${n} cartas:`,
    odds: 'Probabilidad',
    left2: '(quedan 2 cartas por salir).',
    left1: '(queda 1 carta por salir).',
    exactIs: 'El valor exacto es',
    exactFlop: (u: number) => `al menos un out entre las ${u} cartas que quedan, en dos cartas`,
    exactTurn: (n: number, u: number) => `${n} de ${u} cartas`,
    wrongOuts: (n: number) => `El porcentaje se corrige con los outs correctos (${n}), no con los que has contado.`,
    pct: (v: number) => `${v} %`,
    dec: ',',
  },
} satisfies Record<Lang, unknown>;

const SCORE_KEY = SCORE_KEYS.outs;

/** Colour of each out type in the map and the explanation. */
const REASON_COLOR: Record<OutReason, string> = {
  straight_flush: '#f472b6',
  quads: '#f472b6',
  full_house: '#fbbf24',
  flush: '#22e4ff',
  straight: '#a855f7',
  trips: '#a3ff6b',
  two_pair: '#38bdf8',
  top_pair: '#fb923c',
  pair: '#94a3b8',
  high_card: '#94a3b8',
};

/** Map of the 52 cards: yours and the board dimmed, outs lit up by type. */
function OutsMap({ known, outColor }: { known: Set<string>; outColor: Map<string, string> }) {
  const ranks = [...RANKS].reverse();
  return (
    <div className="mt-3 flex flex-col gap-1" aria-hidden="true">
      {SUITS.map((suit) => (
        <div key={suit} className="grid grid-cols-13 gap-0.5 sm:gap-1">
          {ranks.map((rank) => {
            const k = `${rank}${suit}`;
            const color = outColor.get(k);
            const isKnown = known.has(k);
            return (
              <span
                key={k}
                style={color ? { borderColor: color, boxShadow: `0 0 10px -2px ${color}`, color } : undefined}
                className={`flex aspect-[5/6] items-center justify-center rounded border font-mono text-[9px] leading-none sm:text-[11px] ${
                  color
                    ? 'bg-white/[0.06] font-bold'
                    : isKnown
                      ? 'border-white/30 bg-white/20 text-white'
                      : 'border-white/5 text-slate-600'
                }`}
              >
                {rankLabel(rank)}
                {suit}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function OutsTrainer() {
  const { lang } = useLang();
  const t = T[lang];
  const [deal, setDeal] = useState<OutsDeal>(() => dealOuts());
  const [handNo, setHandNo] = useState(1);
  const [outsAnswer, setOutsAnswer] = useState<number | null>(null);
  const [pctAnswer, setPctAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState<Score>(() => loadScore(SCORE_KEY));
  const [showRules, setShowRules] = useState(false);

  const result = useMemo(() => computeOuts(deal.hole, deal.board, lang), [deal, lang]);
  const pctOptions = useMemo(() => percentOptions(result), [result]);
  const outsCount = result.outs.length;
  const outsOptions = useMemo(
    () => Array.from({ length: Math.max(24, outsCount) }, (_, i) => i + 1),
    [outsCount],
  );
  const canCheck = outsAnswer !== null && pctAnswer !== null && !checked;

  const footerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (checked) footerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [checked]);

  useEffect(() => saveScore(SCORE_KEY, score), [score]);

  const check = useCallback(() => {
    if (outsAnswer === null || pctAnswer === null || checked) return;
    setScore((s) => recordResults(s, [outsAnswer === outsCount, pctAnswer === result.estimate]));
    setChecked(true);
  }, [outsAnswer, pctAnswer, checked, outsCount, result.estimate]);

  const next = useCallback(() => {
    setDeal(dealOuts());
    setHandNo((n) => n + 1);
    setOutsAnswer(null);
    setPctAnswer(null);
    setChecked(false);
  }, []);

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

  const known = useMemo(() => new Set([...deal.hole, ...deal.board].map(cardKey)), [deal]);
  const outColor = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of result.groups) for (const c of g.cards) m.set(cardKey(c), REASON_COLOR[g.reason]);
    return m;
  }, [result]);

  const isFlop = result.street === 'flop';
  const pctLabels = Object.fromEntries(pctOptions.map((v) => [v, t.pct(v)]));

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-2xl flex-col gap-5 px-4 py-5 sm:py-8">
      <ToolHeader
        title="Outs"
        index="03"
        actions={
          <button onClick={() => setShowRules(true)} className={headerButtonClass}>
            {t.rules}
          </button>
        }
      />

      <Scoreboard score={score} />

      <section
        aria-label={t.table}
        className="neon-border relative overflow-hidden rounded-[2.25rem] bg-[radial-gradient(ellipse_at_center,_#2a0f2e_0%,_#150b30_45%,_#070918_100%)] px-3 py-6 shadow-[0_0_60px_-20px_var(--color-neon-pink),inset_0_0_60px_rgba(0,0,0,0.6)] sm:py-9"
      >
        <div className="pointer-events-none absolute inset-3 animate-glow rounded-[50%] border border-neon-pink/20 shadow-[inset_0_0_40px_-10px_var(--color-neon-pink)] sm:inset-5" />
        <div className="relative flex items-center justify-between px-2 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
          <span>
            {t.hand} #{String(handNo).padStart(3, '0')}
          </span>
          <span className="text-neon-pink">
            {isFlop ? t.flopTag : t.turnTag}
          </span>
        </div>

        <div className="relative mt-3 flex flex-col items-center gap-6 sm:gap-8">
          <div className="flex flex-col items-center gap-2.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-neon-pink/80">
              {isFlop ? 'Flop' : 'Flop + Turn'}
            </span>
            <div className="flex gap-1.5 sm:gap-3">
              {deal.board.map((c, i) => (
                <PlayingCard
                  key={`${handNo}-${c.rank}${c.suit}`}
                  card={c}
                  size={isFlop ? 'md' : 'board'}
                  delay={i * 90}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex gap-2 sm:gap-3">
              {deal.hole.map((c, i) => (
                <PlayingCard key={`${handNo}-${c.rank}${c.suit}`} card={c} delay={400 + i * 90} />
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
          options={outsOptions}
          value={outsAnswer}
          correct={checked ? outsCount : null}
          onChange={setOutsAnswer}
          gridClass="grid-cols-6 sm:grid-cols-8 [&>*]:min-h-11 [&>*]:font-mono [&>*]:px-0"
        />
        <OptionGroup
          index="02"
          title={isFlop ? t.q2Flop : t.q2Turn}
          options={pctOptions}
          labels={pctLabels}
          value={pctAnswer}
          correct={checked ? result.estimate : null}
          onChange={setPctAnswer}
          gridClass="grid-cols-4 [&>*]:font-mono"
        />
      </section>

      {checked && (
        <section aria-live="polite" className="flex flex-col gap-2.5">
          <Feedback ok={outsAnswer === outsCount} title={`Outs: ${outsCount}`} delay={0}>
            <p>
              {t.nowYouHave} <span className="text-white">{HAND_LABELS[lang][result.current].toLowerCase()}</span>.{' '}
              {t.improve(outsCount)}
            </p>
            <ul className="mt-2 space-y-2">
              {result.groups.map((g) => (
                <li key={g.reason} className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em]"
                    style={{ color: REASON_COLOR[g.reason] }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: REASON_COLOR[g.reason] }} />
                    {HAND_LABELS[lang][g.reason]} · {g.cards.length}
                  </span>
                  {g.cards.map((c) => (
                    <CardChip key={cardKey(c)} card={c} />
                  ))}
                </li>
              ))}
            </ul>
            <OutsMap known={known} outColor={outColor} />
          </Feedback>
          <Feedback ok={pctAnswer === result.estimate} title={`${t.odds}: ${t.pct(result.estimate)}`} delay={90}>
            <p>
              {ruleText(result, lang)} {isFlop ? t.left2 : t.left1} {t.exactIs}{' '}
              <span className="font-mono text-white">{t.pct(Number(result.exact.toFixed(1))).replace('.', t.dec)}</span> (
              {isFlop ? t.exactFlop(result.unseen) : t.exactTurn(outsCount, result.unseen)}).
            </p>
            {outsAnswer !== null && outsAnswer !== outsCount && (
              <p className="mt-1 text-slate-400">
                {t.wrongOuts(outsCount)}
              </p>
            )}
          </Feedback>
        </section>
      )}

      <div ref={footerRef} className="mt-auto pb-2 pt-1">
        <PrimaryButton checked={checked} disabled={!checked && !canCheck} onClick={checked ? next : check} />
        <div className="mt-4 flex flex-wrap items-center justify-end gap-3 text-sm text-slate-400">
          <ResetScoreButton onReset={() => setScore(EMPTY_SCORE)} />
        </div>
        <ShortcutHint />
      </div>

      {showRules && <OutsRules onClose={() => setShowRules(false)} />}
    </div>
  );
}
