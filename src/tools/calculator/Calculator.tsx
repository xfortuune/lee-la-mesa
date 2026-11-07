import { type CSSProperties, useCallback, useMemo, useState } from 'react';
import { PlayingCard } from '../../components/PlayingCard';
import { CARD_SIZES, type CardSize, cardKey } from '../../components/cardStyles';
import { ToolHeader, headerButtonClass } from '../../components/ToolHeader';
import { type Lang, useLang } from '../../i18n/lang';
import { type Card, HAND_CATEGORIES, HAND_LABELS, currentHand } from '../../logic';
import { toolById } from '../registry';
import { CardPicker } from './CardPicker';
import { useEquity } from './useEquity';

const MAX_PLAYERS = 10;
const TOOL = toolById('calculator');

const T = {
  en: {
    clear: 'Clear',
    table: 'Table',
    street: 'Street',
    players: 'players',
    playersSection: 'Players',
    calculating: 'Calculating…',
    exact: 'Exact',
    combos: 'combinations',
    sims: 'simulations',
    you: 'You',
    player: 'Player',
    p: 'P',
    remove: 'Remove player',
    favorite: 'Favorite',
    win: 'Win',
    tie: 'Tie',
    now: 'Now',
    randomHand: 'Random hand',
    oneRandom: 'One random card',
    add: 'Add player',
    atRiver: 'By the river',
    handOdds: 'Odds of each final hand',
    hint: 'Tap a slot to pick a card · cards you leave empty are dealt at random',
    pick: 'Pick',
    change: 'Change',
    card: 'card',
    ofBoard: 'of the board',
    yourHand: 'your hand',
    locale: 'en-US',
  },
  es: {
    clear: 'Borrar',
    table: 'Mesa',
    street: 'Calle',
    players: 'jugadores',
    playersSection: 'Jugadores',
    calculating: 'Calculando…',
    exact: 'Exacto',
    combos: 'combinaciones',
    sims: 'simulaciones',
    you: 'Tú',
    player: 'Jugador',
    p: 'J',
    remove: 'Quitar jugador',
    favorite: 'Favorito',
    win: 'Gana',
    tie: 'Empata',
    now: 'Ahora',
    randomHand: 'Mano aleatoria',
    oneRandom: 'Una carta aleatoria',
    add: 'Añadir jugador',
    atRiver: 'Al river',
    handOdds: 'Probabilidad de cada jugada',
    hint: 'Toca una casilla para elegir carta · las cartas sin elegir se reparten al azar',
    pick: 'Elegir',
    change: 'Cambiar',
    card: 'carta',
    ofBoard: 'de la mesa',
    yourHand: 'tu mano',
    locale: 'es-ES',
  },
} satisfies Record<Lang, Record<string, string>>;
const BOARD_LABELS = ['Flop', 'Flop', 'Flop', 'Turn', 'River'];
const PLAYER_COLORS = ['#22e4ff', '#a855f7', '#f472b6', '#a3ff6b', '#fbbf24', '#38bdf8', '#fb7185', '#34d399', '#c084fc', '#f97316'];

type Slot = { kind: 'player'; p: number; i: number } | { kind: 'board'; i: number };

const emptyPlayers = (n: number): (Card | null)[][] => Array.from({ length: n }, () => [null, null]);
const emptyBoard = (): (Card | null)[] => [null, null, null, null, null];
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

function CardSlot({
  card,
  size,
  label,
  active,
  onClick,
  lang,
}: {
  card: Card | null;
  size: CardSize;
  label: string;
  active: boolean;
  onClick: () => void;
  lang: Lang;
}) {
  const t = T[lang];
  const box = CARD_SIZES[size].box;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${card ? t.change : t.pick} ${label}`}
      className={`relative shrink-0 rounded-xl transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-cyan ${
        active ? 'ring-2 ring-neon-cyan ring-offset-2 ring-offset-void' : ''
      }`}
    >
      {card ? (
        <PlayingCard card={card} size={size} />
      ) : (
        <div
          className={`grid place-items-center border border-dashed border-neon-cyan/30 bg-neon-cyan/[0.03] text-neon-cyan/60 transition hover:border-neon-cyan/70 hover:bg-neon-cyan/10 hover:text-neon-cyan hover:shadow-[0_0_20px_-6px_var(--color-neon-cyan)] ${box}`}
        >
          <span className={size === 'sm' ? 'text-lg' : 'text-2xl'}>+</span>
        </div>
      )}
    </button>
  );
}

export default function Calculadora() {
  const { lang } = useLang();
  const t = T[lang];
  const playerName = (p: number) => (p === 0 ? t.you : `${t.player} ${p + 1}`);
  const [players, setPlayers] = useState(() => emptyPlayers(2));
  const [board, setBoard] = useState(emptyBoard);
  const [picking, setPicking] = useState<Slot | null>(null);
  const [focus, setFocus] = useState(0);

  const input = useMemo(() => ({ players, board }), [players, board]);
  const { result, error, busy } = useEquity(input);

  const cardAt = useCallback(
    (s: Slot) => (s.kind === 'board' ? board[s.i] : players[s.p][s.i]),
    [board, players],
  );

  const setCardAt = (s: Slot, card: Card | null) => {
    if (s.kind === 'board') setBoard((b) => b.map((c, i) => (i === s.i ? card : c)));
    else setPlayers((ps) => ps.map((h, p) => (p === s.p ? h.map((c, i) => (i === s.i ? card : c)) : h)));
  };

  // Cards taken in any other slot
  const usedElsewhere = useMemo(() => {
    const set = new Set<string>();
    const add = (c: Card | null) => c && set.add(cardKey(c));
    board.forEach((c, i) => !(picking?.kind === 'board' && picking.i === i) && add(c));
    players.forEach((h, p) =>
      h.forEach((c, i) => !(picking?.kind === 'player' && picking.p === p && picking.i === i) && add(c)),
    );
    return set;
  }, [board, players, picking]);

  /** After picking, jump to the next empty slot in the same group (or close). */
  const pick = (card: Card) => {
    if (!picking) return;
    setCardAt(picking, card);
    let next: Slot | null = null;
    if (picking.kind === 'board') {
      // Only advances within the flop; turn and river are picked one at a time.
      const i = board.findIndex((c, idx) => idx > picking.i && idx < 3 && !c);
      if (i >= 0) next = { kind: 'board', i };
    } else {
      const other = 1 - picking.i;
      if (!players[picking.p][other]) next = { kind: 'player', p: picking.p, i: other };
    }
    setPicking(next);
  };

  const pickerTitle = (s: Slot) =>
    s.kind === 'board'
      ? `${t.table} · ${BOARD_LABELS[s.i]}${s.i < 3 ? ` ${s.i + 1}` : ''}`
      : `${playerName(s.p)} · ${t.card} ${s.i + 1}`;

  const addPlayer = () => setPlayers((ps) => (ps.length < MAX_PLAYERS ? [...ps, [null, null]] : ps));
  const removePlayer = (p: number) => {
    setPlayers((ps) => ps.filter((_, i) => i !== p));
    setFocus((f) => (f === p ? 0 : f > p ? f - 1 : f));
  };
  const clearAll = () => {
    setPlayers(emptyPlayers(2));
    setBoard(emptyBoard());
    setFocus(0);
  };

  const shown = result && result.players.length === players.length ? result : null;
  const best = shown ? Math.max(...shown.players.map((p) => p.equity)) : -1;
  const focusData = shown?.players[focus];
  const boardCount = board.filter(Boolean).length;
  const street =
    boardCount === 0 ? 'Preflop' : boardCount <= 3 ? 'Flop' : boardCount === 4 ? 'Turn' : 'River';

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-8">
      <ToolHeader
        title={TOOL.text[lang].name}
        index="02"
        actions={
          <button onClick={clearAll} className={headerButtonClass}>
            {t.clear}
          </button>
        }
      />

      {/* Board */}
      <section
        aria-label={t.table}
        className="neon-border relative overflow-hidden rounded-[2.25rem] bg-[radial-gradient(ellipse_at_center,_#0f2a3a_0%,_#0b1530_45%,_#070918_100%)] px-3 py-5 shadow-[0_0_60px_-20px_var(--color-neon-cyan),inset_0_0_60px_rgba(0,0,0,0.6)] sm:py-7"
      >
        <div className="pointer-events-none absolute inset-3 animate-glow rounded-[50%] border border-neon-cyan/20 shadow-[inset_0_0_40px_-10px_var(--color-neon-cyan)] sm:inset-5" />
        <div className="relative flex items-center justify-between px-2 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
          <span>
            {t.street} · <span className="text-neon-cyan">{street}</span>
          </span>
          <span>
            {players.length} {t.players}
          </span>
        </div>
        <div className="relative mt-4 flex justify-center gap-1.5 sm:gap-3">
          {board.map((c, i) => (
            <div key={i} className={`flex flex-col items-center gap-1.5 ${i === 3 ? 'ml-1.5 sm:ml-4' : ''} ${i === 4 ? 'ml-1.5 sm:ml-4' : ''}`}>
              <CardSlot
                card={c}
                size="board"
                label={`${t.card} ${i + 1} ${t.ofBoard}`}
                lang={lang}
                active={picking?.kind === 'board' && picking.i === i}
                onClick={() => setPicking({ kind: 'board', i })}
              />
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-slate-500 sm:text-[10px]">
                {BOARD_LABELS[i]}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-4 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">
          {busy ? (
            <>
              <span className="h-2 w-2 animate-ping rounded-full bg-neon-cyan" />
              {t.calculating}
            </>
          ) : error ? (
            <span className="text-rose-300">{error}</span>
          ) : shown ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]" />
              {shown.method === 'exact'
                ? `${t.exact} · ${shown.samples.toLocaleString(t.locale)} ${t.combos}`
                : `Monte Carlo · ${shown.samples.toLocaleString(t.locale)} ${t.sims}`}
            </>
          ) : null}
        </div>
      </section>

      {/* Players */}
      <section aria-label={t.playersSection} className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4">
        {players.map((hole, p) => {
          const res = shown?.players[p];
          const leader = !!res && res.equity === best && best > 0;
          const color = PLAYER_COLORS[p % PLAYER_COLORS.length];
          const known = hole.filter(Boolean).length;
          const hand = currentHand(hole, board);
          return (
            <div
              key={p}
              style={{ '--pc': color } as CSSProperties}
              className={`relative flex animate-rise flex-col gap-3 overflow-hidden rounded-2xl border bg-white/[0.03] p-3 backdrop-blur transition sm:p-4 ${
                leader
                  ? 'border-[var(--pc)]/60 shadow-[0_0_30px_-10px_var(--pc)]'
                  : 'border-white/10'
              } ${busy ? 'opacity-90' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--pc)] shadow-[0_0_8px_var(--pc)]" />
                  <span className="truncate">{playerName(p)}</span>
                </span>
                {players.length > 2 ? (
                  <button
                    onClick={() => removePlayer(p)}
                    aria-label={`${t.remove} ${p + 1}`}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-300"
                  >
                    ×
                  </button>
                ) : (
                  leader && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--pc)]">{t.favorite}</span>
                  )
                )}
              </div>

              <div className="flex justify-center gap-1.5">
                {hole.map((c, i) => (
                  <CardSlot
                    key={i}
                    card={c}
                    size="sm"
                    label={`${t.card} ${i + 1} · ${p === 0 ? t.yourHand : playerName(p)}`}
                    lang={lang}
                    active={picking?.kind === 'player' && picking.p === p && picking.i === i}
                    onClick={() => setPicking({ kind: 'player', p, i })}
                  />
                ))}
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-1">
                  <span className="font-mono text-2xl font-bold tabular-nums text-white sm:text-3xl">
                    {res ? pct(res.equity) : '—'}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-slate-500">equity</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-[var(--pc)] shadow-[0_0_10px_var(--pc)] transition-[width] duration-500"
                    style={{ width: res ? `${res.equity * 100}%` : '0%' }}
                  />
                </div>
                <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-400 sm:text-[11px]">
                  <span>
                    {t.win} <span className="text-emerald-300">{res ? pct(res.win) : '—'}</span>
                  </span>
                  <span>
                    {t.tie} <span className="text-amber-200">{res ? pct(res.tie) : '—'}</span>
                  </span>
                </div>
                <p className="mt-1.5 truncate text-xs text-slate-500">
                  {hand ? (
                    <>
                      {t.now}: <span className="text-slate-200">{HAND_LABELS[lang][hand]}</span>
                    </>
                  ) : known === 0 ? (
                    t.randomHand
                  ) : known === 1 ? (
                    t.oneRandom
                  ) : (
                    ' '
                  )}
                </p>
              </div>
            </div>
          );
        })}

        {players.length < MAX_PLAYERS && (
          <button
            onClick={addPlayer}
            className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] text-slate-400 transition hover:border-neon-violet/60 hover:bg-neon-violet/[0.06] hover:text-white hover:shadow-[0_0_30px_-12px_var(--color-neon-violet)]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full border border-current text-xl">+</span>
            <span className="text-sm font-medium">{t.add}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
              {players.length}/{MAX_PLAYERS}
            </span>
          </button>
        )}
      </section>

      {/* Odds of each final hand */}
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur sm:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan/80">{t.atRiver}</p>
            <h2 className="text-lg font-bold text-white">{t.handOdds}</h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {players.map((_, p) => (
              <button
                key={p}
                onClick={() => setFocus(p)}
                style={{ '--pc': PLAYER_COLORS[p % PLAYER_COLORS.length] } as CSSProperties}
                className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] transition ${
                  focus === p
                    ? 'border-[var(--pc)] bg-[var(--pc)]/15 text-white shadow-[0_0_14px_-4px_var(--pc)]'
                    : 'border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {p === 0 ? t.you : `${t.p}${p + 1}`}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {[...HAND_CATEGORIES].reverse().map((name, ri) => {
            const idx = HAND_CATEGORIES.length - 1 - ri;
            const v = focusData?.categories[idx] ?? 0;
            return (
              <div key={name} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-sm text-slate-300">{HAND_LABELS[lang][name]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-violet transition-[width] duration-500"
                    style={{ width: `${Math.min(100, v * 100)}%` }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right font-mono text-xs tabular-nums text-slate-300">
                  {focusData ? pct(v) : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <p className="pb-2 text-center font-mono text-[11px] text-slate-600">
        {t.hint}
      </p>

      {picking && (
        <CardPicker
          title={pickerTitle(picking)}
          current={cardAt(picking)}
          used={usedElsewhere}
          onPick={pick}
          onClear={() => {
            setCardAt(picking, null);
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  );
}
