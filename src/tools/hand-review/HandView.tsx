import { type ReactNode, useMemo, useState } from 'react';
import { CardChip } from '../../components/CardChip';
import { PlayingCard } from '../../components/PlayingCard';
import { useLang } from '../../i18n/lang';
import {
  type Decision,
  type HandHistory,
  STREET_LABELS,
  analyzeHand,
  boardOn,
  buildReviewPrompt,
  describeAction,
  inBB,
  pct,
} from '../../logic';
import { T } from './texts';

function Stat({ label, value, hint, tone = 'text-white' }: { label: string; value: ReactNode; hint?: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">{label}</div>
      <div className={`font-mono text-base font-bold tabular-nums ${tone}`}>{value}</div>
      {hint && <div className="text-[10px] leading-tight text-slate-500">{hint}</div>}
    </div>
  );
}

function DecisionStats({ d, bb }: { d: Decision; bb: number }) {
  const { lang } = useLang();
  const t = T[lang];
  return (
    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Stat label={t.pot} value={inBB(d.pot, bb, lang)} />
      {d.potOdds !== null ? (
        <Stat label={t.potOdds} value={pct(d.potOdds, lang)} hint={`${t.toCall} ${inBB(d.toCall, bb, lang)} · ${t.potOddsHint}`} />
      ) : (
        <Stat label={t.toCall} value="—" />
      )}
      {d.equityVsRandom !== null && (
        <Stat label={t.eqRandom(d.opponents.length)} value={pct(d.equityVsRandom, lang)} tone="text-neon-cyan" />
      )}
      {d.equityVsShown !== null && (
        <Stat label={t.eqShown} value={pct(d.equityVsShown, lang)} hint={t.eqShownHint} tone="text-neon-pink" />
      )}
      {d.spr !== null && <Stat label={t.spr} value={d.spr.toFixed(1)} />}
    </div>
  );
}

function PromptPanel({ prompt }: { prompt: string }) {
  const { lang } = useLang();
  const t = T[lang];
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setOpen(true); // without clipboard access, show the text so it can be copied by hand
    }
  };

  const linkClass =
    'rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-neon-violet/60 hover:text-white';

  return (
    <section className="neon-border animate-rise rounded-3xl bg-white/[0.03] p-4 backdrop-blur sm:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon-violet/80">// AI</p>
      <h2 className="mt-1 text-xl font-bold text-white">{t.aiTitle}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{t.aiIntro}</p>
      <p className="mt-1 text-xs text-slate-500">{t.aiPrivacy}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={copy}
          className="rounded-xl bg-gradient-to-r from-neon-violet to-neon-pink px-4 py-2.5 text-sm font-bold text-void shadow-[0_0_30px_-10px_var(--color-neon-violet)] transition hover:shadow-[0_0_40px_-6px_var(--color-neon-pink)]"
        >
          {copied ? `✓ ${t.copied}` : t.copy}
        </button>
        <a href="https://claude.ai/new" target="_blank" rel="noreferrer" className={linkClass}>
          {t.openClaude} ↗
        </a>
        <a href="https://chatgpt.com/" target="_blank" rel="noreferrer" className={linkClass}>
          {t.openChatGPT} ↗
        </a>
        <button onClick={() => setOpen((o) => !o)} className="px-2 text-sm text-slate-400 underline-offset-2 hover:text-white hover:underline">
          {open ? t.hidePrompt : t.showPrompt}
        </button>
      </div>
      {open && (
        <textarea
          readOnly
          value={prompt}
          rows={14}
          onFocus={(e) => e.currentTarget.select()}
          className="mt-4 w-full rounded-xl border border-white/10 bg-void/60 p-3 font-mono text-xs leading-relaxed text-slate-300 focus:outline-none"
        />
      )}
    </section>
  );
}

export function HandView({ hand }: { hand: HandHistory }) {
  const { lang } = useLang();
  const t = T[lang];
  const analysis = useMemo(() => analyzeHand(hand), [hand]);
  const prompt = useMemo(() => buildReviewPrompt(hand, analysis, lang), [hand, analysis, lang]);
  const bb = hand.bb;
  const pos = (p: string) => analysis.positions.get(p) ?? '?';
  const label = (p: string) => (p === hand.hero ? `${pos(p)} (${t.you})` : `${pos(p)} · ${p}`);
  const decisionAt = new Map(analysis.decisions.map((d) => [d.index, d]));
  const net = analysis.heroNet;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary */}
      <section className="neon-border relative animate-rise overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_top,_#1b2a10_0%,_#0b1530_55%,_#070918_100%)] p-4 shadow-[0_0_60px_-24px_var(--color-neon-lime)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          <span>
            {t.hand} #{hand.handId.split('-').pop()}
          </span>
          <span>
            {hand.table} · {hand.maxSeats}-max
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-5">
          {hand.heroCards && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2">
                {hand.heroCards.map((c) => (
                  <PlayingCard key={`${c.rank}${c.suit}`} card={c} size="sm" />
                ))}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-lime/80">{t.yourHand}</span>
            </div>
          )}
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label={t.position} value={analysis.heroPosition ?? '—'} tone="text-neon-lime" />
            <Stat label={t.stakes} value={`${hand.sb}/${hand.bb}${hand.currency}`} />
            <Stat label={t.stack} value={inBB(analysis.heroStackBB * bb, bb, lang)} />
            <Stat
              label={t.result}
              value={`${net > 0 ? '+' : ''}${inBB(net, bb, lang)}`}
              hint={`${net > 0 ? '+' : ''}${net.toFixed(2)}${hand.currency}`}
              tone={net > 0 ? 'text-emerald-300' : net < 0 ? 'text-rose-300' : 'text-white'}
            />
          </div>
        </div>
      </section>

      {/* Seats */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur sm:p-5">
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-slate-400">{t.table}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {hand.players.map((p) => {
            const me = p.name === hand.hero;
            return (
              <div
                key={p.name}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm ${
                  me ? 'border-neon-lime/50 bg-neon-lime/10 text-white' : 'border-white/10 bg-white/[0.02] text-slate-300'
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-bold">{pos(p.name)}</span>
                  <span className="truncate">{me ? t.you : p.name}</span>
                </span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-slate-400">{inBB(p.stack, bb, lang)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Streets */}
      {analysis.streets.map((street) => {
        const actions = hand.actions.map((a, i) => ({ a, i })).filter(({ a }) => a.street === street);
        const board = boardOn(hand, street);
        const pot = street === 'preflop' ? hand.sb + hand.bb : analysis.potByStreet[street];
        const played = actions.filter(({ a }) => !a.type.startsWith('post'));
        return (
          <section key={street} className="animate-rise rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">{STREET_LABELS[lang][street]}</h2>
                <div className="flex gap-1">
                  {board.map((c) => (
                    <CardChip key={`${c.rank}${c.suit}`} card={c} />
                  ))}
                </div>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {t.pot} {inBB(pot, bb, lang)}
              </span>
            </div>
            {played.length === 0 ? (
              <p className="text-sm text-slate-500">{t.noAction}</p>
            ) : (
              <ol className="flex flex-col gap-1.5">
                {actions.map(({ a, i }) => {
                  const d = decisionAt.get(i);
                  const mine = a.player === hand.hero;
                  return (
                    <li
                      key={i}
                      className={
                        d
                          ? 'rounded-2xl border border-neon-lime/40 bg-neon-lime/[0.06] p-3 shadow-[0_0_30px_-16px_var(--color-neon-lime)]'
                          : 'px-1 text-sm'
                      }
                    >
                      {d && (
                        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-neon-lime">{t.decision}</span>
                      )}
                      <span className={mine ? 'font-semibold text-white' : a.type.startsWith('post') ? 'text-slate-500' : 'text-slate-300'}>
                        {describeAction(a, bb, label, lang)}
                      </span>
                      {d && <DecisionStats d={d} bb={bb} />}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        );
      })}

      {/* Showdown */}
      {(hand.showdown.length > 0 || hand.winners.length > 0) && (
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur sm:p-5">
          <h2 className="mb-3 text-lg font-bold text-white">{t.showdown}</h2>
          <ul className="flex flex-col gap-2 text-sm text-slate-300">
            {hand.showdown.map((s) => (
              <li key={s.player} className="flex items-center gap-2">
                <span className="w-28 shrink-0 truncate">{label(s.player)}</span>
                {s.cards.map((c) => (
                  <CardChip key={`${c.rank}${c.suit}`} card={c} />
                ))}
              </li>
            ))}
            {hand.winners.map((w) => (
              <li key={`w-${w.player}`} className="font-semibold text-emerald-300">
                {label(w.player)} {t.wins} {inBB(w.amount, bb, lang)} ({w.amount.toFixed(2)}
                {hand.currency})
              </li>
            ))}
          </ul>
        </section>
      )}

      <PromptPanel prompt={prompt} />
    </div>
  );
}
