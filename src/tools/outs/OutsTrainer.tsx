import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InfoModal } from '../../components/InfoModal';
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
import { SUIT_TEXT, cardKey } from '../../components/cardStyles';
import { EMPTY_SCORE, type Score, loadScore, recordResults, saveScore } from '../../lib/score';
import {
  type Card,
  type OutReason,
  type OutsDeal,
  RANKS,
  SUITS,
  computeOuts,
  dealOuts,
  percentOptions,
  rankLabel,
  ruleText,
} from '../../logic';
import { SCORE_KEYS } from '../registry';

const SCORE_KEY = SCORE_KEYS.outs;

/** Color de cada tipo de out en el mapa y en la explicación. */
const REASON_COLOR: Record<OutReason, string> = {
  'Escalera de color': '#f472b6',
  Póker: '#f472b6',
  Full: '#fbbf24',
  Color: '#22e4ff',
  Escalera: '#a855f7',
  Trío: '#a3ff6b',
  'Dobles parejas': '#38bdf8',
  'Pareja máxima': '#fb923c',
  Pareja: '#94a3b8',
  'Carta alta': '#94a3b8',
};

function CardChip({ card }: { card: Card }) {
  return (
    <span
      className={`inline-flex items-center rounded-md bg-gradient-to-br from-white to-slate-200 px-1.5 py-0.5 font-mono text-xs font-bold leading-none ${SUIT_TEXT[card.suit]}`}
    >
      {rankLabel(card.rank)}
      {card.suit}
    </span>
  );
}

/** Mapa de las 52 cartas: las tuyas y la mesa atenuadas, los outs iluminados por tipo. */
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

function OutsRules({ onClose }: { onClose: () => void }) {
  return (
    <InfoModal eyebrow="Cómo se cuentan" title="Outs" onClose={onClose}>
      <section>
        <h3>01 · Qué es un out</h3>
        <p>
          Una carta que, si sale en la siguiente calle, <b>mejora tu jugada usando tus cartas</b>. Si la carta solo
          mejora la mesa (y por tanto a todos), no cuenta.
        </p>
      </section>
      <section>
        <h3>02 · Proyectos</h3>
        <ul>
          <li><b>Color</b>: 4 cartas del mismo palo → 9 outs.</li>
          <li><b>Escalera abierta</b>: 4 seguidas → 8 outs. <b>Gutshot</b> (falta una del medio) → 4 outs.</li>
          <li>Si tienes los dos, las cartas que cuentan doble se cuentan una sola vez (color + abierta = 15).</li>
        </ul>
      </section>
      <section>
        <h3>03 · Mejoras</h3>
        <ul>
          <li><b>Overcards</b>: cada carta tuya más alta que toda la mesa da 3 outs para pareja máxima.</li>
          <li><b>Pareja en mano → trío</b>: 2 outs.</li>
          <li><b>Pareja → dobles o trío</b>: 5 outs (3 de tu otra carta + 2 de la pareja).</li>
          <li><b>Dobles parejas → full</b>: 4 outs. <b>Trío → full o póker</b>: 7 outs en el flop.</li>
          <li>Emparejar una carta tuya por debajo de la más alta de la mesa no cuenta.</li>
        </ul>
      </section>
      <section>
        <h3>04 · Regla del 2 y del 4</h3>
        <ul>
          <li><b>En el flop</b> (quedan 2 cartas): outs × 4 ≈ % de ligar hasta el river.</li>
          <li><b>En el turn</b> (queda 1 carta): outs × 2 ≈ % de ligar en el river.</li>
          <li>Tras corregir verás también el % exacto para comparar.</li>
        </ul>
      </section>
      <section>
        <h3>05 · Repartos</h3>
        <ul>
          <li>Siempre hay al menos 2 outs; la mesa nunca está emparejada y nunca tienes ya escalera o mejor.</li>
          <li>
            <kbd className="rounded-md border border-white/20 bg-white/5 px-1.5 font-mono text-xs">Enter</kbd> o{' '}
            <kbd className="rounded-md border border-white/20 bg-white/5 px-1.5 font-mono text-xs">Espacio</kbd>:
            comprobar / siguiente mano.
          </li>
        </ul>
      </section>
    </InfoModal>
  );
}

export default function OutsTrainer() {
  const [deal, setDeal] = useState<OutsDeal>(() => dealOuts());
  const [handNo, setHandNo] = useState(1);
  const [outsAnswer, setOutsAnswer] = useState<number | null>(null);
  const [pctAnswer, setPctAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState<Score>(() => loadScore(SCORE_KEY));
  const [showRules, setShowRules] = useState(false);

  const result = useMemo(() => computeOuts(deal.hole, deal.board), [deal]);
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
  const pctLabels = Object.fromEntries(pctOptions.map((v) => [v, `${v} %`]));

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-2xl flex-col gap-5 px-4 py-5 sm:py-8">
      <ToolHeader
        title="Outs"
        index="03"
        actions={
          <button onClick={() => setShowRules(true)} className={headerButtonClass}>
            Reglas
          </button>
        }
      />

      <Scoreboard score={score} />

      <section
        aria-label="Mesa"
        className="neon-border relative overflow-hidden rounded-[2.25rem] bg-[radial-gradient(ellipse_at_center,_#2a0f2e_0%,_#150b30_45%,_#070918_100%)] px-3 py-6 shadow-[0_0_60px_-20px_var(--color-neon-pink),inset_0_0_60px_rgba(0,0,0,0.6)] sm:py-9"
      >
        <div className="pointer-events-none absolute inset-3 animate-glow rounded-[50%] border border-neon-pink/20 shadow-[inset_0_0_40px_-10px_var(--color-neon-pink)] sm:inset-5" />
        <div className="relative flex items-center justify-between px-2 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
          <span>Mano #{String(handNo).padStart(3, '0')}</span>
          <span className="text-neon-pink">
            {isFlop ? 'Flop · quedan 2 cartas' : 'Turn · queda 1 carta'}
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
            <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-neon-violet/80">Tu mano</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <OptionGroup
          index="01"
          title="¿Cuántos outs tienes?"
          options={outsOptions}
          value={outsAnswer}
          correct={checked ? outsCount : null}
          onChange={setOutsAnswer}
          gridClass="grid-cols-6 sm:grid-cols-8 [&>*]:min-h-11 [&>*]:font-mono [&>*]:px-0"
        />
        <OptionGroup
          index="02"
          title={isFlop ? 'Probabilidad de ligar hasta el river' : 'Probabilidad de ligar en el river'}
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
              Ahora tienes <span className="text-white">{result.current.toLowerCase()}</span>. Te mejoran{' '}
              {outsCount} cartas:
            </p>
            <ul className="mt-2 space-y-2">
              {result.groups.map((g) => (
                <li key={g.reason} className="flex flex-wrap items-center gap-1.5">
                  <span
                    className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em]"
                    style={{ color: REASON_COLOR[g.reason] }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: REASON_COLOR[g.reason] }} />
                    {g.reason} · {g.cards.length}
                  </span>
                  {g.cards.map((c) => (
                    <CardChip key={cardKey(c)} card={c} />
                  ))}
                </li>
              ))}
            </ul>
            <OutsMap known={known} outColor={outColor} />
          </Feedback>
          <Feedback ok={pctAnswer === result.estimate} title={`Probabilidad: ${result.estimate} %`} delay={90}>
            <p>
              {ruleText(result)}{' '}
              {isFlop ? '(quedan 2 cartas por salir).' : '(queda 1 carta por salir).'} El valor exacto es{' '}
              <span className="font-mono text-white">{result.exact.toFixed(1).replace('.', ',')} %</span> (
              {isFlop
                ? `al menos un out entre las ${result.unseen} cartas que quedan, en dos cartas`
                : `${outsCount} de ${result.unseen} cartas`}
              ).
            </p>
            {outsAnswer !== null && outsAnswer !== outsCount && (
              <p className="mt-1 text-slate-400">
                El porcentaje se corrige con los outs correctos ({outsCount}), no con los que has contado.
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
